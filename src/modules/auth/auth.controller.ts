import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { SignupDto } from './dto/signup.dto';
import { RolesGuard } from './guard/role.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<Response> {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<Response> {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  async sendOtp(@Body() sendOtpDto: SendOtpDto): Promise<Response> {
    return this.userService.sendOtpForgotPassword(sendOtpDto.mobile_number);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<Response> {
    const { mobile_number, otp, new_password } = resetPasswordDto;
    return this.userService.resetPassword(mobile_number, otp, new_password);
  }

  @Post('logout')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.CUSTOMER)
  async logout(@Request() req): Promise<Response> {
    const user = req.user;
    return this.userService.logout(user.user_id);
  }

  @Get('superadmin')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.BRANCH_MANAGER)
  getSuperAdminResource() {
    return { message: 'This is a Super Admin resource' };
  }
}
