import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from 'src/modules/auth/dto/signup.dto';
import { appendBaseUrlToImagesOrPdf } from 'src/utils/image-path.helper';
import { Response } from '../../dto/response.dto';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async signup(signUpDto: SignupDto): Promise<Response> {
    const user = await this.userService.signup(signUpDto);
    const token = await this.generateJwtToken(user);
    delete user.password;
    return {
      message: 'User signup successfully',
      statusCode: 200,
      data: { token, user },
    };
  }

  async login(loginDto: LoginDto): Promise<Response> {
    const responseData = await this.userService.login(loginDto);
    if (responseData.statusCode === 200) {
      responseData.data.token = await this.generateJwtToken(
        responseData.data.user,
      );
      delete responseData.data.user.password;
    }
    return responseData;
  }

  async validateToken(token: string): Promise<Response> {
    try {
      const decoded = this.jwtService.verify(token);

      const user = await this.userService.findUserById(decoded.user_id);

      if (!user) {
        throw new UnauthorizedException('invalid or expire token');
      }
      const userImageWithUrl = appendBaseUrlToImagesOrPdf([user])[0];
      return {
        statusCode: 200,
        message: 'User data retrived successfully',
        data: { user: userImageWithUrl },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expire token');
    }
  }

  async generateJwtToken(user) {
    return this.jwtService.sign({
      email: user.email,
      user_id: user.user_id,
      role_id: user.role_id,
    });
  }
}
