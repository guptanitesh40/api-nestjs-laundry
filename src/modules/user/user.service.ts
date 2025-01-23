import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Response } from 'src/dto/response.dto';
import { DeviceUser } from 'src/entities/device-user.entity';
import { LoginHistory } from 'src/entities/login-history.entity';
import { Order } from 'src/entities/order.entity';
import { Otp } from 'src/entities/otp.entity';
import { UserBranchMapping } from 'src/entities/user-branch-mapping.entity';
import { UserCompanyMapping } from 'src/entities/user-company-mapping.entity';
import { User } from 'src/entities/user.entity';
import { OtpType } from 'src/enum/otp.enum';
import { PaymentStatus } from 'src/enum/payment.enum';
import { Role } from 'src/enum/role.enum';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { SignupDto } from 'src/modules/auth/dto/signup.dto';
import {
  appendBaseUrlToImages,
  appendBaseUrlToImagesIdProof,
} from 'src/utils/image-path.helper';
import { getOrderStatusDetails } from 'src/utils/order-status.helper';
import twilio from 'twilio';
import { In, MoreThan, Repository } from 'typeorm';
import { UserFilterDto } from '../dto/users-filter.dto';
import { OrderService } from '../order/order.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(DeviceUser)
    private deviceUserRepository: Repository<DeviceUser>,
    @InjectRepository(LoginHistory)
    private loginHistoryRepository: Repository<LoginHistory>,
    @InjectRepository(Otp) private otpRepository: Repository<Otp>,
    @InjectRepository(UserCompanyMapping)
    private userCompanyMappingRepository: Repository<UserCompanyMapping>,
    @InjectRepository(UserBranchMapping)
    private userBranchMappingRepository: Repository<UserBranchMapping>,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {}

  async signup(signUpDto: SignupDto): Promise<User> {
    const { mobile_number, otp, vendor_code } = signUpDto;
    const existingUser = await this.userRepository.findOne({
      where: { mobile_number },
    });

    if (existingUser) {
      throw new BadRequestException('Mobile number already registered');
    }

    const isValidOtp = await this.validateOtp(mobile_number, otp);
    if (!isValidOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    let vendor_id = null;
    if (vendor_code) {
      const vendor = await this.userRepository.findOne({
        where: { vendor_code },
      });

      if (!vendor) {
        throw new BadRequestException('invalid vendor code');
      }
      vendor_id = vendor.user_id;
      delete signUpDto.vendor_code;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(signUpDto.password, salt);

    const user = this.userRepository.create({
      ...signUpDto,
      password: hashedPassword,
      vendor_id,
    });
    return await this.userRepository.save(user);
  }

  async login(loginDto: LoginDto): Promise<Response> {
    const { username, password, role_id, device_type, device_token } = loginDto;
    let mobileCondition = {};
    if (Number(username)) {
      mobileCondition = {
        mobile_number: Number(username),
        role_id: role_id,
      };
    }
    const user = await this.userRepository.findOne({
      where: [
        {
          email: username,
          role_id: role_id,
        },
        mobileCondition,
      ],
    });
    const loginErrrorMessage = {
      statusCode: 403,
      message: 'Your username and password do not match with our records',
    };

    if (!user) {
      return loginErrrorMessage;
    }
    const pass = await bcrypt.compare(password, user.password);

    if (!pass) {
      return loginErrrorMessage;
    }

    await this.storeLoginHistory(user);
    const deviceUser = await this.storeDeviceUser(
      user,
      device_type,
      device_token,
    );

    return {
      statusCode: 200,
      message: 'User Loggedin succssfully',
      data: { user, deviceUser },
    };
  }

  async changePassword(
    user_id: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<Response> {
    const { old_password, new_password } = changePasswordDto;
    const user = await this.userRepository.findOne({
      where: { user_id: user_id },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(
      old_password,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);
    await this.userRepository.save(user);
    delete user.password;
    return {
      statusCode: 200,
      message: 'password change succssfully',
      data: { user },
    };
  }

  async storeLoginHistory(user: User): Promise<void> {
    const loginHistory = new LoginHistory();
    loginHistory.user_id = user.user_id;
    await this.loginHistoryRepository.save(loginHistory);
  }

  async storeDeviceUser(
    user: User,
    device_type: number,
    device_token: string,
  ): Promise<any> {
    const deviceUser = new DeviceUser();
    deviceUser.device_type = device_type || 0;
    deviceUser.device_token = device_token || '';
    deviceUser.user_id = user.user_id;
    const result = await this.deviceUserRepository.save(deviceUser);
    return result;
  }

  async createUser(
    admin_id: number,
    createUserDto: CreateUserDto,
  ): Promise<Response> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    createUserDto.created_by_user_id = admin_id;

    if (createUserDto.role_id === Role.VENDOR) {
      createUserDto.vendor_code = crypto.randomBytes(6).toString('hex');
      const expiryDays = createUserDto.vendor_code_expiry as unknown as number;
      createUserDto.vendor_code_expiry = this.getVendorCodeExpiry(expiryDays);
      createUserDto.commission_percentage =
        createUserDto.commission_percentage || 0;
      createUserDto.security_deposit = createUserDto.security_deposit || 0;
    }

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const result = await this.userRepository.save(user);

    const companyMappings = [];
    const branchMappings = [];
    const companyIds = [];
    const branchIds = [];

    if (createUserDto.role_id === Role.SUB_ADMIN && createUserDto.company_ids) {
      for (const companyId of createUserDto.company_ids) {
        companyMappings.push(
          this.userCompanyMappingRepository.create({
            user_id: result.user_id,
            company_id: companyId,
          }),
        );
        companyIds.push(companyId);
      }
    }

    if (
      createUserDto.role_id === Role.BRANCH_MANAGER &&
      createUserDto.branch_ids
    ) {
      for (const branchId of createUserDto.branch_ids) {
        branchMappings.push(
          this.userBranchMappingRepository.create({
            user_id: result.user_id,
            branch_id: branchId,
          }),
        );
        branchIds.push(branchId);
      }
    }

    if (companyMappings.length > 0) {
      await this.userCompanyMappingRepository.save(companyMappings);
    }

    if (branchMappings.length > 0) {
      await this.userBranchMappingRepository.save(branchMappings);
    }

    return {
      statusCode: 201,
      message: 'User added successfully',
      data: {
        result,
        company_ids: companyIds,
        branch_ids: branchIds,
      },
    };
  }

  getVendorCodeExpiry(expiryDays: number): Date {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + expiryDays);
    return currentDate;
  }

  async updateUser(
    user_id: number,
    updateUserDto: UpdateUserDto,
    imagePath?: string,
  ): Promise<Response> {
    const user = await this.userRepository.findOne({
      where: { user_id, deleted_at: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { branch_ids, company_ids, ...userUpdateData } = updateUserDto;

    if (imagePath) {
      userUpdateData.image = imagePath;
    }

    if (userUpdateData.password) {
      const salt = await bcrypt.genSalt(10);
      userUpdateData.password = await bcrypt.hash(
        userUpdateData.password,
        salt,
      );
    } else {
      delete userUpdateData.password;
    }

    await this.userRepository.update(user_id, userUpdateData);

    let companyMappings = [];
    let branchMappings = [];

    if (updateUserDto.role_id === Role.SUB_ADMIN) {
      if (company_ids) {
        await this.userCompanyMappingRepository.delete({ user_id });
        companyMappings = await this.userCompanyMappingRepository.save(
          company_ids.map((companyId) =>
            this.userCompanyMappingRepository.create({
              user_id,
              company_id: companyId,
            }),
          ),
        );
      } else {
        companyMappings = await this.userCompanyMappingRepository.find({
          where: { user_id },
          select: ['company_id'],
        });
      }
    }

    if (updateUserDto.role_id === Role.BRANCH_MANAGER) {
      if (branch_ids) {
        await this.userBranchMappingRepository.delete({ user_id });
        branchMappings = await this.userBranchMappingRepository.save(
          branch_ids.map((branchId) =>
            this.userBranchMappingRepository.create({
              user_id,
              branch_id: branchId,
            }),
          ),
        );
      } else {
        branchMappings = await this.userBranchMappingRepository.find({
          where: { user_id },
          select: ['branch_id'],
        });
      }
    }

    const updatedUser = await this.userRepository.findOne({
      where: { user_id },
    });
    const userWithImageUrl = appendBaseUrlToImages([updatedUser])[0];

    return {
      statusCode: 201,
      message: 'User updated successfully',
      data: {
        result: userWithImageUrl,
        company_ids: companyMappings.map((mapping) => mapping.company_id) || [],
        branch_ids: branchMappings.map((mapping) => mapping.branch_id) || [],
      },
    };
  }

  async editUser(
    user_id: number,
    updateUserDto: UpdateUserDto,
    imagePath?: string,
    idProofPath?: string,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { user_id, deleted_at: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedData = { ...user, ...updateUserDto };

    if (imagePath) {
      updatedData.image = imagePath;
    }

    if (idProofPath) {
      updatedData.id_proof = idProofPath;
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(updateUserDto.password, salt);
    } else {
      delete updatedData.password;
    }

    await this.userRepository.update(user_id, updatedData);
    const updateUser = await this.userRepository.findOne({
      where: { user_id, deleted_at: null },
    });

    const userImageWithUrl = appendBaseUrlToImagesIdProof([updateUser])[0];

    return {
      statusCode: 200,
      message: 'User updated successfully',
      data: {
        user: userImageWithUrl,
      },
    };
  }

  async getUserById(user_id: number): Promise<Response> {
    const userQuery = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.orders', 'orders')
      .leftJoinAndSelect('orders.items', 'items')
      .where('user.user_id = :user_id', { user_id })
      .andWhere('user.deleted_at IS NULL')
      .andWhere('orders.deleted_at IS NULL')
      .select([
        'user.user_id',
        'user.first_name',
        'user.last_name',
        'user.email',
        'user.mobile_number',
        'user.gender',
        'user.image',
        'user.id_proof',
        'user.education_qualification',
        'user.role_id',
        'user.created_by_user_id',
        'orders.order_id',
        'orders.payment_status',
        'orders.total',
        'orders.order_status',
        'orders.payment_type',
        'orders.paid_amount',
        'orders.kasar_amount',
        'items.item_id',
      ]);

    const user: any = await userQuery.getOne();

    user.orders.map((order) => {
      order.admin_order_status = getOrderStatusDetails(order);

      return {
        order_id: order.id,
        admin_order_status: order.admin_order_status,
      };
    });

    let pending_due_amount = 0;
    for (const order of user.orders) {
      const { pending_due_amount: orderDueAmount } =
        await this.calculatePendingDueAmount(order);
      pending_due_amount += orderDueAmount;
    }

    return {
      statusCode: 200,
      message: 'User found',
      data: {
        user,
        total_pending_amount: pending_due_amount,
      },
    };
  }

  async findOne(user_id: number): Promise<Response> {
    const userQuery = this.userRepository
      .createQueryBuilder('user')
      .where('user.user_id = :user_id', { user_id })
      .andWhere('user.deleted_at IS NULL')
      .select([
        'user.user_id',
        'user.first_name',
        'user.last_name',
        'user.email',
        'user.mobile_number',
        'user.gender',
        'user.image',
        'user.id_proof',
        'user.education_qualification',
        'user.role_id',
        'user.created_by_user_id',
      ]);

    const user: any = await userQuery.getOne();

    const userImageWithUrl = appendBaseUrlToImagesIdProof([user])[0];

    return {
      statusCode: 200,
      message: 'User found',
      data: {
        user: userImageWithUrl,
      },
    };
  }

  async calculatePendingDueAmount(
    order: Order,
  ): Promise<{ pending_due_amount: number }> {
    let pending_due_amount = 0;

    if (
      (order.total > order.paid_amount &&
        order.payment_status == PaymentStatus.PAYMENT_PENDING) ||
      order.payment_status == PaymentStatus.PARTIAL_PAYMENT_RECEIVED
    ) {
      const pending_amount =
        order.total -
        order.paid_amount -
        (order.kasar_amount || 0) -
        (order.refund_amount || 0);
      pending_due_amount += pending_amount;
    }

    return { pending_due_amount };
  }

  async getAllUsers(userFilterDto: UserFilterDto): Promise<Response> {
    const {
      per_page,
      page_number,
      search,
      sort_by,
      order,
      roles,
      genders,
      branches_ids,
      companies_ids,
    } = userFilterDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    const userQuery = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.UserCompanyMappings', 'companyMapping')
      .leftJoinAndSelect('companyMapping.company', 'company')
      .leftJoinAndSelect('user.userBranchMappings', 'branchMapping')
      .leftJoinAndSelect('user.orders', 'orders')
      .leftJoinAndSelect('orders.items', 'items')
      .leftJoinAndSelect('branchMapping.branch', 'branch')
      .where('user.deleted_at IS NULL')
      .andWhere('companyMapping.deleted_at IS NULL')
      .andWhere('company.deleted_at IS NULL')
      .andWhere('branchMapping.deleted_at IS NULL')
      .andWhere('branch.deleted_at IS NULL')
      .andWhere('orders.deleted_at IS NULL')
      .select([
        'user',
        'companyMapping.company_id',
        'branchMapping.branch_id',
        'branch.branch_id',
        'branch.branch_name',
        'company.company_id',
        'company.company_name',
        'orders.order_id',
        'orders.payment_status',
        'orders.total',
        'orders.paid_amount',
        'orders.kasar_amount',
        'orders.refund_amount',
        'items.item_id',
      ])
      .addSelect("CONCAT(user.first_name, ' ', user.last_name)", 'full_name')
      .take(perPage)
      .skip(skip);

    if (search) {
      userQuery.andWhere(
        '(user.first_name LIKE :search OR ' +
          'user.last_name LIKE :search OR ' +
          'user.email LIKE :search OR ' +
          'user.mobile_number LIKE :search OR ' +
          `CONCAT(user.first_name,' ',user.last_name) LIKE :search)`,
        { search: `%${search}%` },
      );
    }

    if (roles) {
      userQuery.andWhere('user.role IN (:...roles)', { roles: roles });
    }

    if (genders) {
      userQuery.andWhere('user.gender IN (:...genders)', { genders: genders });
    }

    if (branches_ids) {
      userQuery.andWhere('branchMapping.branch_id IN (:...branchIds)', {
        branchIds: branches_ids,
      });
    }

    if (companies_ids) {
      userQuery.andWhere('companyMapping.company_id IN (:...companyIds)', {
        companyIds: companies_ids,
      });
    }

    let sortColumn = 'user.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      sortColumn = `user.${sort_by}`;
    }

    if (order) {
      sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    }

    userQuery.orderBy(sortColumn, sortOrder);

    const [users, total] = await userQuery.getManyAndCount();

    const userIds = users.map((user) => user.user_id);

    const companyMappings = await this.userCompanyMappingRepository.find({
      where: { user_id: In(userIds) },
      select: ['user_id', 'company_id', 'company'],
      relations: ['company'],
    });

    const branchMappings = await this.userBranchMappingRepository.find({
      where: { user_id: In(userIds) },
      select: ['user_id', 'branch_id', 'branch'],
      relations: ['branch'],
    });

    const userCompanyMap: any = new Map<number, number[]>();
    const userBranchMap: any = new Map<number, number[]>();

    companyMappings.forEach((mapping) => {
      if (!userCompanyMap.has(mapping.user_id)) {
        userCompanyMap.set(mapping.user_id, []);
      }
      userCompanyMap.get(mapping.user_id)?.push(mapping.company?.company_name);
      userCompanyMap.get(mapping.user_id)?.push(mapping.company_id);
    });

    branchMappings.forEach((mapping) => {
      if (!userBranchMap.has(mapping.user_id)) {
        userBranchMap.set(mapping.user_id, []);
      }
      userBranchMap.get(mapping.user_id)?.push(mapping.branch?.branch_name);
      userBranchMap.get(mapping.user_id)?.push(mapping.branch_id);
    });

    const usersWithMappings = await Promise.all(
      users.map(async (user) => {
        let pending_due_amount = 0;

        for (const order of user.orders) {
          const { pending_due_amount: orderDueAmount } =
            await this.calculatePendingDueAmount(order);
          pending_due_amount += orderDueAmount;
        }

        return {
          ...user,
          companies: userCompanyMap.get(user.user_id) || [],
          branches: userBranchMap.get(user.user_id) || [],
          total_due_amount: pending_due_amount,
        };
      }),
    );

    return {
      statusCode: 200,
      message: 'Users retrieved successfully',
      data: {
        users: usersWithMappings,
        limit: perPage,
        page_number: pageNumber,
        count: total,
      },
    };
  }

  async deleteUser(user_id: number): Promise<Response> {
    const user = await this.userRepository.findOne({
      where: { user_id, deleted_at: null },
    });

    if (!user) {
      return {
        statusCode: 404,
        message: 'user not found',
        data: null,
      };
    }

    user.deleted_at = new Date();

    await this.userRepository.save(user);

    return {
      statusCode: 200,
      message: 'User deleted successfully',
      data: user,
    };
  }

  async getAllDeliveryBoys(): Promise<Response> {
    const deliveryBoys = await this.userRepository.find({
      where: {
        role_id: Role.DELIVERY_BOY,
        deleted_at: null,
      },
    });

    return {
      statusCode: 200,
      message: 'Delivery boys retrieved successfully',
      data: { deliveryBoys },
    };
  }

  async findOneByRole(user_id: number, role_id: Role): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { user_id: user_id, role_id: role_id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${user_id} not found`);
    }

    return user;
  }

  async generateOtp(mobile_number: number, type: OtpType): Promise<number> {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpEntry = this.otpRepository.create({
      mobile_number,
      otp,
      type,
      created_at: new Date(),
    });
    await this.otpRepository.save(otpEntry);

    const countryCode = '+91';
    const formattedMobileNumber = `${countryCode}${String(mobile_number).replace(/^0/, '')}`;

    try {
      await twilioClient.messages.create({
        body: `Your OTP for ${type} is: ${otp}`,
        from: TWILIO_PHONE_NUMBER,
        to: formattedMobileNumber,
      });
    } catch (error) {
      console.error('Twilio Error:', error.response?.data || error.message);
      throw new BadRequestException('Failed to send OTP via SMS');
    }

    return otp;
  }

  async validateOtp(mobile_number: number, otp: number): Promise<boolean> {
    const tenMinutesAgo = new Date(new Date().getTime() - 10 * 60 * 1000);
    const otpEntry = await this.otpRepository.findOne({
      where: {
        mobile_number,
        otp,
        deleted_at: null,
        created_at: MoreThan(tenMinutesAgo),
      },
    });
    if (otpEntry) {
      await this.otpRepository.save(otpEntry);
      return true;
    }
    return false;
  }

  async sendOtpForgotPassword(mobile_number: number): Promise<Response> {
    const user = await this.userRepository.findOne({
      where: { mobile_number },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.generateOtp(mobile_number, OtpType.FORGOT_PASSWORD);

    return {
      statusCode: 200,
      message: 'OTP Sent Successfully',
      data: null,
    };
  }

  async resetPassword(
    mobile_number: number,
    otp: number,
    new_password: string,
  ): Promise<Response> {
    const user = await this.userRepository.findOne({
      where: {
        mobile_number,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otpEntry = await this.otpRepository.findOne({
      where: {
        mobile_number,
        otp,
        type: OtpType.FORGOT_PASSWORD,
        created_at: MoreThan(new Date(new Date().getTime() - 10 * 60 * 1000)),
      },
    });

    if (!otpEntry) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);

    await this.userRepository.save(user);

    await this.otpRepository.delete({
      mobile_number,
      otp,
    });

    return {
      statusCode: 200,
      message: 'Password reset successfully',
      data: null,
    };
  }

  async logout(user_id: number): Promise<Response> {
    const user = await this.deviceUserRepository.findOne({
      where: { user_id: user_id },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    await this.deviceUserRepository.delete({
      user_id: user_id,
    });
    return {
      statusCode: 200,
      message: 'logout successfully',
      data: user,
    };
  }

  async findUserById(userId: number): Promise<User> {
    return this.userRepository.findOne({
      where: { user_id: userId },
      select: [
        'user_id',
        'role_id',
        'first_name',
        'last_name',
        'email',
        'mobile_number',
        'image',
        'id_proof',
      ],
    });
  }

  async findUsersByIds(userIds: number[]): Promise<User[]> {
    return this.userRepository.find({
      where: { user_id: In(userIds) },
      select: [
        'user_id',
        'role_id',
        'first_name',
        'last_name',
        'mobile_number',
        'commission_percentage',
      ],
    });
  }

  async getAllUsersByRole(role_id: number, search?: string): Promise<Response> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.role_id = :role_id', { role_id })
      .select([
        'user.user_id',
        'user.first_name',
        'user.last_name',
        'user.mobile_number',
        'user.email',
      ]);

    if (search) {
      queryBuilder.andWhere(
        `(user.first_name LIKE :search OR user.last_name LIKE :search OR user.email LIKE :search OR user.mobile_number LIKE :search OR CONCAT(user.first_name , ' ', user.last_name) LIKE :search )`,
        { search: `%${search}%` },
      );
    }

    const users = await queryBuilder.take(20).getMany();

    return {
      statusCode: 200,
      message: 'Users fetched successfully',
      data: users,
    };
  }
}
