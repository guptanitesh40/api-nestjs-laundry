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
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilePath } from 'src/constants/FilePath';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { OtpType } from 'src/enum/otp.enum';
import { Role } from 'src/enum/role.enum';
import { fileFieldsInterceptor } from 'src/utils/file-upload.helper';
import { RolesGuard } from '../auth/guard/role.guard';
import { UserFilterDto } from '../dto/users-filter.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Patch('change-password')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.CUSTOMER)
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

  @Get('customer')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.CUSTOMER)
  async findOne(@Request() req): Promise<Response> {
    const user = req.user;
    return await this.userService.findOne(user.user_id);
  }

  @Put('customer')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.CUSTOMER)
  @UseInterceptors(fileFieldsInterceptor())
  async update(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      id_proof?: Express.Multer.File[];
    },
  ): Promise<Response> {
    const user = req.user;

    const imageFile = files?.image?.[0];
    const idProofFile = files?.id_proof?.[0];

    const imagePath = imageFile
      ? FilePath.USER_IMAGES + '/' + imageFile.filename
      : null;
    const idProofPath = idProofFile
      ? FilePath.USER_ID_PROOF + '/' + idProofFile.filename
      : null;

    return await this.userService.editUser(
      user.user_id,
      updateUserDto,
      imagePath,
      idProofPath,
    );
  }

  @Get('by-role')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async getAllUsersByRole(
    @Query('role_id') role_id: number,
    @Query('search') search?: string,
  ): Promise<Response> {
    return this.userService.getAllUsersByRole(role_id, search);
  }

  @Post()
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async createUser(
    @Request() req,
    @Body() createUserDto: CreateUserDto,
  ): Promise<Response> {
    const user = req.user;
    return await this.userService.createUser(user.user_id, createUserDto);
  }

  @Put(':user_id')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN)
  @UseInterceptors(fileFieldsInterceptor())
  async updateUser(
    @Param('user_id') user_id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      id_proof?: Express.Multer.File[];
    },
  ): Promise<Response> {
    const imageFile = files?.image?.[0];
    const idProofFile = files?.id_proof?.[0];

    const imagePath = imageFile
      ? FilePath.USER_IMAGES + '/' + imageFile.filename
      : null;

    const idProofPath = idProofFile
      ? FilePath.USER_ID_PROOF + '/' + idProofFile.filename
      : null;

    return await this.userService.updateUser(
      user_id,
      updateUserDto,
      imagePath,
      idProofPath,
    );
  }

  @Get('delivery-boys')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN)
  async getDeliveryBoys(): Promise<Response> {
    return await this.userService.getAllDeliveryBoys();
  }

  @Get(':user_id')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN)
  async getUserById(@Param('user_id') user_id: number): Promise<Response> {
    return await this.userService.getUserById(user_id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN)
  async getAllUsers(@Query() userFilterDto: UserFilterDto): Promise<Response> {
    return await this.userService.getAllUsers(userFilterDto);
  }

  @Delete('customer')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.CUSTOMER)
  async removeUser(@Request() req): Promise<Response> {
    const user = req.user;
    return await this.userService.deleteUser(user.user_id);
  }

  @Delete(':user_id')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN)
  async deleteUser(@Param('user_id') user_id: number): Promise<Response> {
    return await this.userService.deleteUser(user_id);
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
