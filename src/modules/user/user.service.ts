import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Response } from 'src/dto/response.dto';
import { DeviceUser } from 'src/entities/device-user.entity';
import { LoginHistory } from 'src/entities/login-history.entity';
import { Otp } from 'src/entities/otp.entity';
import { UserBranchMapping } from 'src/entities/user-branch-mapping.entity';
import { UserCompanyMapping } from 'src/entities/user-company-mapping.entity';
import { User } from 'src/entities/user.entity';
import { OtpType } from 'src/enum/otp.enum';
import { Role } from 'src/enum/role.enum';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { SignupDto } from 'src/modules/auth/dto/signup.dto';
import { appendBaseUrlToImages } from 'src/utils/image-path.helper';
import twilio from 'twilio';
import { In, MoreThan, Repository } from 'typeorm';
import { UserFilterDto } from '../dto/users-filter.dto';
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

    await this.storeLoginHistory(user, device_type);
    await this.storeDeviceUser(user, device_type, device_token);

    return {
      statusCode: 200,
      message: 'User Loggedin succssfully',
      data: { user },
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

  async storeLoginHistory(user: User, device_type: string): Promise<void> {
    const loginHistory = new LoginHistory();
    loginHistory.user_id = user.user_id;
    loginHistory.type = device_type || '';
    await this.loginHistoryRepository.save(loginHistory);
  }

  async storeDeviceUser(
    user: User,
    device_type: string,
    device_token: string,
  ): Promise<void> {
    const deviceUser = new DeviceUser();
    deviceUser.device_type = device_type || '';
    deviceUser.device_token = device_token || '';
    deviceUser.user_id = user.user_id;
    await this.deviceUserRepository.save(deviceUser);
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
      updatedData.image = this.appendBaseUrl(imagePath);
    }

    if (idProofPath) {
      updatedData.id_proof = this.appendBaseUrl(idProofPath);
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(updateUserDto.password, salt);
    } else {
      delete updatedData.password;
    }

    await this.userRepository.update(user_id, updatedData);

    return {
      statusCode: 200,
      message: 'User updated successfully',
      data: {
        user: { updatedData },
      },
    };
  }

  private appendBaseUrl(path: string): string {
    const baseUrl = process.env.BASE_URL;
    return baseUrl ? `${baseUrl}/${path}` : path;
  }

  async getUserById(user_id: number): Promise<Response> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.UserCompanyMappings', 'companyMapping')
      .leftJoinAndSelect('user.userBranchMappings', 'branchMapping')
      .where('user.user_id = :user_id', { user_id })
      .andWhere('user.deleted_at IS NULL')
      .select(['user', 'companyMapping.company_id', 'branchMapping.branch_id'])
      .getOne();

    if (!user) {
      return {
        statusCode: 404,
        message: 'User not found',
        data: null,
      };
    }

    const mappedUser = {
      ...user,
      branch_ids: user.userBranchMappings.map((branch) => branch.branch_id),
      company_ids: user.UserCompanyMappings.map(
        (company) => company.company_id,
      ),
    };

    return {
      statusCode: 200,
      message: 'User found',
      data: {
        user: mappedUser,
      },
    };
  }

  async getAllUsers(userFilterDto: UserFilterDto): Promise<Response> {
    const {
      per_page,
      page_number,
      search,
      sort_by,
      order,
      role,
      gender,
      branch_id,
      company_id,
    } = userFilterDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    const userQuery = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.UserCompanyMappings', 'companyMapping')
      .leftJoinAndSelect('user.userBranchMappings', 'branchMapping')
      .where('user.deleted_at IS NULL')
      .select(['user', 'companyMapping.company_id', 'branchMapping.branch_id'])
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

    if (role) {
      userQuery.andWhere('user.role IN (:...roles)', { roles: role });
    }

    if (gender) {
      userQuery.andWhere('user.gender IN (:...genders)', { genders: gender });
    }

    if (branch_id) {
      userQuery.andWhere('branchMapping.branch_id IN (:...branchIds)', {
        branchIds: branch_id,
      });
    }

    if (company_id) {
      userQuery.andWhere('companyMapping.company_id IN (:...companyIds)', {
        companyIds: company_id,
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
      select: ['user_id', 'company_id'],
    });

    const branchMappings = await this.userBranchMappingRepository.find({
      where: { user_id: In(userIds) },
      select: ['user_id', 'branch_id'],
    });

    const userCompanyMap = new Map<number, number[]>();
    const userBranchMap = new Map<number, number[]>();

    companyMappings.forEach((mapping) => {
      if (!userCompanyMap.has(mapping.user_id)) {
        userCompanyMap.set(mapping.user_id, []);
      }
      userCompanyMap.get(mapping.user_id)?.push(mapping.company_id);
    });

    branchMappings.forEach((mapping) => {
      if (!userBranchMap.has(mapping.user_id)) {
        userBranchMap.set(mapping.user_id, []);
      }
      userBranchMap.get(mapping.user_id)?.push(mapping.branch_id);
    });

    const usersWithMappings = users.map((user) => ({
      ...user,
      company_ids: userCompanyMap.get(user.user_id) || [],
      branch_ids: userBranchMap.get(user.user_id) || [],
    }));

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
