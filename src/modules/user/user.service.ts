import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import csvParser from 'csv-parser';
import { firstValueFrom } from 'rxjs';
import {
  vision360_template_id_otp_send,
  vision360_template_id_password_send,
} from 'src/constants/TemplateId';
import { Response } from 'src/dto/response.dto';
import { DeviceUser } from 'src/entities/device-user.entity';
import { LoginHistory } from 'src/entities/login-history.entity';
import { Order } from 'src/entities/order.entity';
import { Otp } from 'src/entities/otp.entity';
import { UserBranchMapping } from 'src/entities/user-branch-mapping.entity';
import { UserCompanyMapping } from 'src/entities/user-company-mapping.entity';
import { User } from 'src/entities/user.entity';
import { WorkshopManagerMapping } from 'src/entities/workshop-manager-mapping.entity';
import { DeviceType } from 'src/enum/device_type.enum';
import { OtpType } from 'src/enum/otp.enum';
import { PaymentStatus } from 'src/enum/payment.enum';
import { Role } from 'src/enum/role.enum';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { SignupDto } from 'src/modules/auth/dto/signup.dto';
import { appendBaseUrlToImagesOrPdf } from 'src/utils/image-path.helper';
import { getOrderStatusDetails } from 'src/utils/order-status.helper';
import { Readable } from 'stream';
import { In, MoreThan, Repository } from 'typeorm';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { UserFilterDto } from '../dto/users-filter.dto';
import { OrderService } from '../order/order.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
    @InjectRepository(WorkshopManagerMapping)
    private workshopManagerMappingRepository: Repository<WorkshopManagerMapping>,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly httpService: HttpService,
  ) {}

  async signup(signUpDto: SignupDto): Promise<User> {
    const { mobile_number, otp, vendor_code, device_type, device_token } =
      signUpDto;
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

    const users = await this.userRepository.save(user);

    await this.storeDeviceUser(users, device_type, device_token);

    return users;
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

    if (user.image || user.id_proof) {
      appendBaseUrlToImagesOrPdf([user])[0];
    }
    const pass = await bcrypt.compare(password, user.password);

    if (!pass) {
      return loginErrrorMessage;
    }

    const deviceUser = await this.storeDeviceUser(
      user,
      device_type,
      device_token,
    );
    await this.storeLoginHistory(user, device_type || null);

    return {
      statusCode: 200,
      message: 'User Loggedin successfully',
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
      message: 'Password change successfully',
      data: { user },
    };
  }

  async storeLoginHistory(user: User, device_type: number): Promise<void> {
    const loginHistory = new LoginHistory();

    loginHistory.user_id = user.user_id;
    loginHistory.type = String(device_type) || null;
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
    let password = '';
    if (!createUserDto.password) {
      password = String(createUserDto.mobile_number);
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password || createUserDto.password,
      salt,
    );

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

    const workshopMappings = [];
    const workshopIds = [];

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

    if (
      createUserDto.role_id === Role.WORKSHOP_MANAGER &&
      createUserDto.workshop_ids
    ) {
      for (const workshopId of createUserDto.workshop_ids) {
        workshopMappings.push(
          this.workshopManagerMappingRepository.create({
            user_id: result.user_id,
            workshop_id: workshopId,
          }),
        );
        workshopIds.push(workshopId);
      }
    }

    if (companyMappings.length > 0) {
      await this.userCompanyMappingRepository.save(companyMappings);
    }

    if (branchMappings.length > 0) {
      await this.userBranchMappingRepository.save(branchMappings);
    }

    if (workshopMappings.length > 0) {
      await this.workshopManagerMappingRepository.save(workshopMappings);
    }
    if (!createUserDto.password) {
      const formattedMobileNumber = `91${String(createUserDto.mobile_number).replace(/^0+/, '')}`;

      const full_name = `${createUserDto.first_name} ${createUserDto.last_name}`;

      const message = `Dear ${full_name}, Welcome to Sikka Cleaners! Your account has been successfully created , Your Password Is: ${password}. For security reasons, please do not share your password with anyone.`;

      const baseUrl = process.env.VISION360_BASE_URL;
      const apiKey = process.env.VISION360_API_KEY;
      const senderId = process.env.VISION360_SENDER_ID;

      const smsUrl = `${baseUrl}?authkey=${apiKey}&mobiles=${formattedMobileNumber}&message=${encodeURIComponent(message)}&sender=${senderId}&DLT_TE_ID=${vision360_template_id_password_send}`;

      try {
        const response = await axios.get(smsUrl);

        if (response.status !== 200) {
          throw new Error('Failed to send OTP');
        }
      } catch (error) {
        console.error(
          'SMS Sending Failed:',
          error.response?.data || error.message,
        );
      }
    }

    return {
      statusCode: 201,
      message: 'User added successfully',
      data: {
        result,
        company_ids: companyIds,
        branch_ids: branchIds,
        workshop_ids: workshopIds,
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
    idProofPath?: string,
  ): Promise<Response> {
    const user = await this.userRepository.findOne({
      where: { user_id, deleted_at: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { branch_ids, company_ids, workshop_ids, ...userUpdateData } =
      updateUserDto;

    if (imagePath) {
      userUpdateData.image = imagePath;
    }

    if (idProofPath) {
      userUpdateData.id_proof = idProofPath;
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
    let workshopMappings = [];

    if (Number(updateUserDto.role_id) === Role.SUB_ADMIN) {
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

    if (Number(updateUserDto.role_id) === Role.BRANCH_MANAGER) {
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

    if (Number(updateUserDto.role_id) === Role.WORKSHOP_MANAGER) {
      if (workshop_ids) {
        await this.workshopManagerMappingRepository.delete({ user_id });
        workshopMappings = await this.workshopManagerMappingRepository.save(
          workshop_ids?.map((workshopId) =>
            this.workshopManagerMappingRepository.create({
              user_id,
              workshop_id: workshopId,
            }),
          ),
        );
      } else {
        workshopMappings = await this.workshopManagerMappingRepository?.find({
          where: { user_id },
          select: ['workshop_id'],
        });
      }
    }

    const updatedUser = await this.userRepository.findOne({
      where: { user_id },
    });
    const userWithImageUrl = appendBaseUrlToImagesOrPdf([updatedUser])[0];

    return {
      statusCode: 201,
      message: 'User updated successfully',
      data: {
        result: userWithImageUrl,
        company_ids: companyMappings.map((mapping) => mapping.company_id) || [],
        branch_ids: branchMappings.map((mapping) => mapping.branch_id) || [],
        workshop_ids:
          workshopMappings?.map((mapping) => mapping?.workshop_id) || [],
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

    const userImageWithUrl = appendBaseUrlToImagesOrPdf([updateUser])[0];

    return {
      statusCode: 200,
      message: 'User updated successfully',
      data: {
        user: userImageWithUrl,
      },
    };
  }

  async getUserById(
    user_id: number,
    paginationQueryDto?: PaginationQueryDto,
  ): Promise<Response> {
    const userQuery = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.orders', 'orders', 'orders.deleted_at IS NULL ')
      .leftJoinAndSelect('orders.items', 'items')
      .leftJoinAndSelect('user.UserCompanyMappings', 'companyMapping')
      .leftJoinAndSelect('companyMapping.company', 'company')
      .leftJoinAndSelect('user.userBranchMappings', 'branchMapping')
      .leftJoinAndSelect('branchMapping.branch', 'branch')
      .leftJoinAndSelect('user.workshopManagerMappings', 'workshopMapping')
      .leftJoinAndSelect('workshopMapping.workshop', 'workshop')
      .where('user.user_id = :user_id', { user_id })
      .andWhere('user.deleted_at IS NULL')
      .andWhere('orders.deleted_at IS NULL')
      .andWhere('companyMapping.deleted_at IS NULL')
      .andWhere('company.deleted_at IS NULL')
      .andWhere('branchMapping.deleted_at IS NULL')
      .andWhere('branch.deleted_at IS NULL')
      .andWhere('workshopMapping.deleted_at IS NULL')
      .andWhere('workshop.deleted_at IS NUll')
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
        'companyMapping.company_id',
        'branchMapping.branch_id',
        'branch.branch_name',
        'company.company_name',
        'workshopMapping.workshop_id',
        'workshop.workshop_name',
      ]);
    const user: any = await userQuery.getOne();

    const orders: any = await this.orderService.getOrdersByUserId(
      user_id,
      paginationQueryDto,
    );

    for (const order of orders.orders) {
      order.admin_order_status = getOrderStatusDetails(order);
      order.remaining_amount =
        order.total - order.paid_amount - order.kasar_amount ||
        0 - order.refund_amount ||
        0;
    }

    let pending_due_amount = 0;
    for (const order of user.orders) {
      const { pending_due_amount: orderDueAmount } =
        await this.calculatePendingDueAmount(order);
      pending_due_amount += orderDueAmount;
    }

    const userImageWithUrl = appendBaseUrlToImagesOrPdf([user])[0];

    const mappedUser = {
      ...userImageWithUrl,
      orders: orders.orders,
      branches: user.userBranchMappings.map(
        (branch) => branch.branch.branch_name,
      ),
      branch_ids: user.userBranchMappings.map((branch) => branch.branch_id),
      companies: user.UserCompanyMappings.map(
        (company) => company.company.company_name,
      ),
      company_ids: user.UserCompanyMappings.map(
        (company) => company.company_id,
      ),
      workshops: user.workshopManagerMappings
        .filter((mapping) => mapping.workshop)
        .map((mapping) => mapping.workshop.workshop_name),

      workshop_ids: user.workshopManagerMappings
        .filter((mapping) => mapping.workshop)
        .map((mapping) => mapping.workshop_id),
    };

    return {
      statusCode: 200,
      message: 'User found',
      data: {
        user: mappedUser,
        total_pending_amount: pending_due_amount,
        limit: orders.limit,
        page_number: orders.page_number,
        count: orders.count,
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

    const userImageWithUrl = appendBaseUrlToImagesOrPdf([user])[0];

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
      .leftJoinAndSelect('user.workshopManagerMappings', 'workshopMapping')
      .leftJoinAndSelect('workshopMapping.workshop', 'workshop')
      .where('user.deleted_at IS NULL')
      .andWhere('companyMapping.deleted_at IS NULL')
      .andWhere('company.deleted_at IS NULL')
      .andWhere('workshopMapping.deleted_at IS NULL')
      .andWhere('workshop.deleted_at IS NULL')
      .andWhere('branchMapping.deleted_at IS NULL')
      .andWhere('branch.deleted_at IS NULL')
      .andWhere('orders.deleted_at IS NULL')
      .select([
        'user',
        'companyMapping.company_id',
        'branchMapping.branch_id',
        'workshopMapping.workshop_id',
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
    } else {
      userQuery.andWhere('user.role_id != :excludeRoleIds', {
        excludeRoleIds: Role.CUSTOMER,
      });
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

    const workshopMappings = await this.workshopManagerMappingRepository.find({
      where: { user_id: In(userIds) },
      select: ['user_id', 'workshop_id'],
      relations: ['workshop'],
    });

    const userCompanyMap: any = new Map<number, number[]>();
    const userBranchMap: any = new Map<number, number[]>();
    const workshopMap: any = new Map<number, number[]>();

    companyMappings.forEach((mapping) => {
      if (!userCompanyMap.has(mapping?.user_id)) {
        userCompanyMap.set(mapping?.user_id, []);
      }
      userCompanyMap
        .get(mapping?.user_id)
        ?.push(mapping?.company?.company_name);
    });

    branchMappings.forEach((mapping) => {
      if (!userBranchMap.has(mapping?.user_id)) {
        userBranchMap.set(mapping?.user_id, []);
      }
      userBranchMap.get(mapping?.user_id)?.push(mapping?.branch?.branch_name);
    });

    workshopMappings.forEach((mapping) => {
      if (!workshopMap.has(mapping?.user_id)) {
        workshopMap.set(mapping?.user_id, []);
      }
      workshopMap.get(mapping?.user_id)?.push(mapping?.workshop?.workshop_name);
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
          workshops: workshopMap.get(user.user_id) || [],
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
        message: 'User not found',
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
        role_id: Role.DELIVERY_BOY_AND_PICKUP_BOY,
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
      where: { user_id: user_id, role_id: role_id, deleted_at: null },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${user_id} not found`);
    }

    return user;
  }

  async generateOtp(mobile_number: number, type: OtpType): Promise<Response> {
    const otp = Math.floor(100000 + Math.random() * 900000);

    const otpEntry = this.otpRepository.create({
      mobile_number,
      otp,
      type,
      created_at: new Date(),
    });
    await this.otpRepository.save(otpEntry);

    const formattedMobileNumber = `91${String(mobile_number).replace(/^0+/, '')}`;

    const apiKey = process.env.VISION360_API_KEY;
    const senderId = process.env.VISION360_SENDER_ID;
    const baseUrl = process.env.VISION360_BASE_URL;

    const message = `Your verification code for Sikka Cleaners is ${otp}. This code is valid for a limited time. Do not share it with anyone.`;

    const url = `${baseUrl}?authkey=${apiKey}&mobiles=${formattedMobileNumber}&message=${encodeURIComponent(message)}&sender=${senderId}&DLT_TE_ID=${vision360_template_id_otp_send}`;

    try {
      const response = await firstValueFrom(this.httpService.post(url, {}));

      if (response.status !== 200) {
        throw new Error('Failed to send OTP');
      }

      return {
        statusCode: 200,
        message: 'OTP has been sent successfully to your mobile number.',
        data: null,
      };
    } catch (error) {
      console.error('Vision360 Error:', error.response?.data || error.message);
      throw new BadRequestException('Failed to send OTP via SMS');
    }
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
      message: 'OTP has been sent successfully to your mobile number.',
      data: null,
    };
  }

  async resetPassword(
    mobile_number: number,
    otp: number,
    new_password: string,
    role_id: number,
  ): Promise<Response> {
    const user = await this.userRepository.findOne({
      where: {
        mobile_number,
        role_id,
        deleted_at: null,
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
    const deviceuser: any = await this.deviceUserRepository.findOne({
      where: { user_id: user_id },
    });

    if (!deviceuser) {
      throw new NotFoundException('user not found');
    }

    deviceuser.deleted_at = new Date();

    await this.deviceUserRepository.save(deviceuser);

    deviceuser.device_id = String(deviceuser.device_id);
    deviceuser.device_type = String(deviceuser.device_type);

    return {
      statusCode: 200,
      message: 'User logout successfully',
      data: deviceuser,
    };
  }

  async findUserById(user_id: number): Promise<any> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userBranchMappings', 'userBranchMappings')
      .select([
        'user.user_id',
        'user.role_id',
        'user.first_name',
        'user.last_name',
        'user.email',
        'user.mobile_number',
        'user.gender',
        'user.image',
        'user.id_proof',
        'userBranchMappings.branch_id',
      ])
      .where('user.user_id = :userId', { userId: user_id })
      .getOne();

    return user;
  }

  async findUsersByIds(user_id: number[]): Promise<User[]> {
    return this.userRepository.find({
      where: { user_id: In(user_id) },
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
      .orderBy('user.created_at', 'DESC')
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

  async getDeviceToken(user_id: number): Promise<string | null> {
    const token = await this.deviceUserRepository.findOne({
      where: {
        user_id: user_id,
        device_type: In([DeviceType.ANDROID, DeviceType.IOS]),
        deleted_at: null,
      },
    });

    return token ? token.device_token : null;
  }

  async getDeviceTokens(user_id: number[]): Promise<any> {
    const tokens = await this.deviceUserRepository.find({
      where: {
        user_id: In(user_id),
        device_type: In([DeviceType.ANDROID, DeviceType.IOS]),
        deleted_at: null,
      },
      select: ['user_id', 'device_token'],
    });

    return tokens.filter((t) => !!t.device_token);
  }

  async getAllCustomerDeviceTokens(): Promise<string[]> {
    const deviceType = [DeviceType.ANDROID, DeviceType.IOS];

    const deviceUsers = await this.deviceUserRepository.find({
      where: {
        user: { role_id: Role.CUSTOMER, deleted_at: null },
        device_type: In(deviceType),
        deleted_at: null,
      },
    });

    return deviceUsers.map((d) => d.device_token).filter((token) => !!token);
  }

  async getLoginLogs(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<Response> {
    const { per_page, page_number, search, sort_by, order } =
      paginationQueryDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    const logs = this.loginHistoryRepository
      .createQueryBuilder('loginHistory')
      .innerJoinAndSelect('loginHistory.user', 'user')
      .where('loginHistory.deleted_at IS NULL')
      .andWhere('user.deleted_at IS NULL')
      .andWhere('user.role_id = :roleId', { roleId: Role.CUSTOMER })
      .select([
        'loginHistory.login_id',
        'loginHistory.created_at',
        'loginHistory.type',
        'user.user_id',
        'user.first_name',
        'user.last_name',
      ])
      .take(perPage)
      .skip(skip);

    if (search) {
      logs.andWhere(
        '(user.first_name LIKE :search OR user.last_name LIKE :search)',
        { search: `%${search}%` },
      );
    }

    let sortColumn = 'loginHistory.created_at';

    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      sortColumn =
        sort_by === 'first_name' || sortColumn === 'last_name'
          ? `user.${sort_by}`
          : `loginHistory.${sort_by}`;
    }
    if (order) {
      sortOrder = order;
    }

    logs.orderBy(sortColumn, sortOrder);

    const [log, total] = await logs.getManyAndCount();

    return {
      statusCode: 200,
      message: 'Customers logs retrived Successfully',
      data: {
        userLogs: log,
        limit: perPage,
        page_number: pageNumber,
        count: total,
      },
    };
  }

  async importFromCsv(buffer: Buffer): Promise<any> {
    const rawRows = [];
    const stream = Readable.from(buffer);

    return new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (row) => rawRows.push(row))
        .on('end', async () => {
          const customers = [];

          for (const row of rawRows) {
            const hashedPassword = await bcrypt.hash(row.password, 10);

            customers.push({
              first_name: row.first_name,
              last_name: row.last_name,
              mobile_number: row.mobile_number,
              password: hashedPassword,
              role_id: 5,
            });
          }

          await this.userRepository.save(customers);
          resolve({
            message: 'Imported successfully',
            count: customers.length,
          });
        })
        .on('error', reject);
    });
  }
}
