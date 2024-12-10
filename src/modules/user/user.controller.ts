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
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { FilePath } from 'src/constants/FilePath';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { OtpType } from 'src/enum/otp.enum';
import { Role } from 'src/enum/role.enum';
import { fileUpload } from 'src/multer/image-upload';
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
    return await this.userService.getUserById(user.user_id);
  }

  @Put('customer')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.CUSTOMER)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'id_proof', maxCount: 1 },
      ],
      {
        storage: fileUpload(FilePath.USER_IMAGES).storage,
        limits: {
          fileSize: Math.max(
            fileUpload(FilePath.USER_IMAGES).limits.fileSize,
            fileUpload(FilePath.USER_ID_PROOF).limits.fileSize,
          ),
        },
        fileFilter: (req, file, cb) => {
          if (file.fieldname === 'image') {
            if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
              cb(
                new HttpException(
                  'Only JPEG, JPG, or PNG image files are allowed!',
                  HttpStatus.BAD_REQUEST,
                ),
                false,
              );
            } else {
              cb(null, true);
            }
          } else if (file.fieldname === 'id_proof') {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
              cb(
                new HttpException(
                  'Only PDF and IMAGE files are allowed!',
                  HttpStatus.BAD_REQUEST,
                ),
                false,
              );
            } else {
              cb(null, true);
            }
          } else {
            cb(null, false);
          }
        },
      },
    ),
  )
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

  @Put(':id')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('image', fileUpload(FilePath.USER_IMAGES)))
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Response> {
    const imagepath = file ? FilePath.USER_IMAGES + '/' + file.filename : null;
    return await this.userService.updateUser(id, updateUserDto, imagepath);
  }

  @Get('delivery-boys')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN)
  async getDeliveryBoys(): Promise<Response> {
    return await this.userService.getAllDeliveryBoys();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN)
  async getUserById(@Param('id') id: number): Promise<Response> {
    return await this.userService.getUserById(id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN)
  async getAllUsers(@Query() userFilterDto: UserFilterDto): Promise<Response> {
    return await this.userService.getAllUsers(userFilterDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
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
