import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { FilePath } from 'src/constants/FilePath';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { fileUpload } from 'src/multer/image-upload';
import { pdfUpload } from 'src/multer/pdf-upload';
import { RolesGuard } from '../auth/guard/role.guard';
import { UpdateSettingDto } from './dto/update-settings.dto';
import { SettingService } from './setting.service';

@Controller()
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Put('admin/settings')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'home_banner_image', maxCount: 1 },
        { name: 'price_pdf_url', maxCount: 1 },
      ],
      {
        storage: multer.diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'home_banner_image') {
              cb(null, FilePath.BANNER_IMAGES);
            } else if (file.fieldname === 'price_pdf_url') {
              cb(null, FilePath.PDF_DIRECTORY);
            } else {
              cb(
                new HttpException(
                  'Invalid file field!',
                  HttpStatus.BAD_REQUEST,
                ),
                null,
              );
            }
          },
        }),
        limits: {
          fileSize: Math.max(
            fileUpload(FilePath.BANNER_IMAGES).limits.fileSize,
            pdfUpload(FilePath.PDF_DIRECTORY).limits.fileSize,
          ),
        },
        fileFilter: (req, file, cb) => {
          if (file.fieldname === 'home_banner_image') {
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
          } else if (file.fieldname === 'price_pdf_url') {
            if (!file.mimetype.match(/\/(pdf)$/)) {
              cb(
                new HttpException(
                  'Only PDF files are allowed!',
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
    @Body() updateSettingDto: UpdateSettingDto,
    @UploadedFiles()
    files: {
      home_banner_image?: Express.Multer.File[];
      price_pdf_url?: Express.Multer.File[];
    },
  ): Promise<Response> {
    const imageFile = files?.home_banner_image?.[0];
    const pdfFile = files?.price_pdf_url?.[0];

    const imagePath = imageFile
      ? FilePath.BANNER_IMAGES + '/' + imageFile.filename
      : null;

    const pdfPath = pdfFile
      ? FilePath.PDF_DIRECTORY + '/' + pdfFile.filename
      : null;

    return await this.settingService.update(
      updateSettingDto,
      imagePath,
      pdfPath,
    );
  }

  @Get('admin/settings')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async findAll(@Query('keys') keys?: string[]): Promise<Response> {
    return await this.settingService.findAll(keys);
  }

  @Get('settings')
  async getAll(@Query('keys') keys?: string[]): Promise<Response> {
    return await this.settingService.findAll(keys);
  }
}
