import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { OtpType } from 'src/enum/otp.enum';
import { Role } from 'src/enum/role.enum';
import { SignupDto } from '../auth/dto/signup.dto';
import { RolesGuard } from '../auth/guard/role.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private userService: UserService) {}

  @Patch('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<Response> {
    const user = req.user;
    return await this.userService.changePassword(
      user.user_id,
      changePasswordDto,
    );
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  async createUser(@Body() signUpDto: SignupDto): Promise<Response> {
    return await this.userService.createUser(signUpDto);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN)
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Response> {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @Get('delivery-boys')
  @Roles(Role.SUPER_ADMIN)
  async getDeliveryBoys(): Promise<Response> {
    return await this.userService.getAllDeliveryBoys();
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN)
  async getUserById(@Param('id') id: number): Promise<Response> {
    return await this.userService.getUserById(id);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  async getAllUsers(): Promise<Response> {
    return await this.userService.getAllUsers();
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  async deleteUser(@Param('id') id: number): Promise<Response> {
    return await this.userService.deleteUser(id);
  }

  @Post('generate')
  async generateOtp(@Body() body: { mobile_number: number; type: OtpType }) {
    const { mobile_number, type } = body;
    const otp = await this.userService.generateOtp(mobile_number, type);
    return {
      statusCode: 200,
      message: 'OTP generated successfully',
      data: { otp },
    };
  }

  @Post('validate')
  @Roles(Role.SUPER_ADMIN)
  async validateOtp(@Body() body: { mobile_number: number; otp: number }) {
    const { mobile_number, otp } = body;
    const isValid = await this.userService.validateOtp(mobile_number, otp);
    if (isValid) {
      return { statusCode: 200, message: 'OTP is valid' };
    } else {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }
  }
}
