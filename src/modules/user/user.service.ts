import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Response } from 'src/dto/response.dto';
import { DeviceUser } from 'src/entities/device-user.entity';
import { LoginHistory } from 'src/entities/login-history.entity';
import { User } from 'src/entities/user.entity';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { SignupDto } from 'src/modules/auth/dto/signup.dto';
import { Repository } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(DeviceUser)
    private deviceUserRepository: Repository<DeviceUser>,
    @InjectRepository(LoginHistory)
    private loginHistoryRepository: Repository<LoginHistory>,
  ) {}

  async signup(signUpDto: SignupDto): Promise<User> {
    const salt = await bcrypt.genSalt(10);

    const hashedpassword = await bcrypt.hash(signUpDto.password, salt);
    const user = this.userRepository.create({
      ...signUpDto,
      password: hashedpassword,
    });
    const result = await this.userRepository.save(user);

    return result;
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
    loginHistory.type = device_type;
    await this.loginHistoryRepository.save(loginHistory);
  }

  async storeDeviceUser(
    user: User,
    device_type: string,
    device_token: string,
  ): Promise<void> {
    const deviceUser = new DeviceUser();
    deviceUser.device_type = device_type;
    deviceUser.device_token = device_token;
    deviceUser.user_id = user.user_id;
    await this.deviceUserRepository.save(deviceUser);
  }

  async createUser(signUpDto: SignupDto): Promise<Response> {
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(signUpDto.password, salt);

    const user = this.userRepository.create({
      ...signUpDto,
      password: hashedpassword,
    });

    const result = await this.userRepository.save(user);

    return {
      statusCode: 201,
      message: 'user added successfully',
      data: { result },
    };
  }

  async updateUser(
    user_id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Response> {
    const user = await this.userRepository.findOne({
      where: { user_id, deleted_at: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.save({
      ...user,
      ...updateUserDto,
    });

    return {
      statusCode: 200,
      message: 'User updated successfully',
      data: { updatedUser },
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

  async getAllUsers(): Promise<Response> {
    const users = await this.userRepository.find({
      where: { deleted_at: null },
    });
    return {
      statusCode: 200,
      message: 'users retrived   successfully,',
      data: { users },
    };
  }

  async deleteUser(user_id: number): Promise<Response> {
    const user = await this.userRepository.findOne({
      where: { user_id, deleted_at: null },
    });

    if (!user) {
      return {
        statusCode: 404,
        message: 'User Not Found',
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
}
