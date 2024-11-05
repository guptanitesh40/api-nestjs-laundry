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
import { User } from 'src/entities/user.entity';
import { OtpType } from 'src/enum/otp.enum';
import { Role } from 'src/enum/role.enum';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { SignupDto } from 'src/modules/auth/dto/signup.dto';
import { appendBaseUrlToImages } from 'src/utils/image-path.helper';
import twilio from 'twilio';
import { MoreThan, Repository } from 'typeorm';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
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

    if (createUserDto.role_id === Role.Vendor) {
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

    return {
      statusCode: 201,
      message: 'User added successfully',
      data: { result },
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

    const updatedData = { ...user, ...updateUserDto };

    if (imagePath) {
      updatedData.image = imagePath;
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(updateUserDto.password, salt);
    } else {
      delete updatedData.password;
    }

    await this.userRepository.update(user_id, updatedData);

    const users = appendBaseUrlToImages([user])[0];
    return {
      statusCode: 200,
      message: 'User updated successfully',
      data: {
        user,
        users,
      },
    };
  }

  async getUserById(user_id: number): Promise<Response> {
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

    return {
      statusCode: 201,
      message: 'user found ',
      data: { user },
    };
  }

  async getAllUsers(paginationQueryDto: PaginationQueryDto): Promise<Response> {
    const { per_page, page_number, search, sort_by, order } =
      paginationQueryDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.deleted_at IS NULL')
      .take(perPage)
      .skip(skip);

    if (search) {
      queryBuilder.andWhere(
        '(user.first_name LIKE :search OR ' +
          'user.last_name LIKE :search OR ' +
          'user.email LIKE :search OR ' +
          'user.mobile_number LIKE :search)',
        { search: `%${search}%` },
      );
    }

    let sortColumn = 'user.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      sortColumn = sort_by;
    }

    if (order) {
      sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    }

    queryBuilder.orderBy(sortColumn, sortOrder);

    const [result, total] = await queryBuilder.getManyAndCount();

    return {
      statusCode: 200,
      message: 'Users retrieved successfully',
      data: { result, limit: perPage, page_number: pageNumber, count: total },
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
    await this.deviceUserRepository.delete({
      user_id: user_id,
    });
    return {
      statusCode: 200,
      message: 'logout successfully',
    };
  }

  async findUserById(userId: number): Promise<User> {
    return this.userRepository.findOne({
      where: { user_id: userId },
      select: [
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
        '(user.first_name LIKE :search OR user.last_name LIKE :search OR user.email LIKE :search OR user.mobile_number LIKE :search)',
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
