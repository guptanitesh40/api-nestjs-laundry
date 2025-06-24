import {
  Body,
  Controller,
  Get,
  Put,
  Query,
  Render,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FilePath } from 'src/constants/FilePath';
import { Response } from 'src/dto/response.dto';
import { fileUpload } from 'src/multer/image-upload';
import { RolesGuard } from '../auth/guard/role.guard';
import { ArraySettingDto, UpdateSettingDto } from './dto/update-settings.dto';
import { SettingService } from './setting.service';

@Controller()
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Put('admin/settings')
  async update(@Body() arraySettingDto: ArraySettingDto): Promise<Response> {
    return await this.settingService.update(arraySettingDto);
  }

  @Put('admin/settings/image')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'home_banner_image', maxCount: 1 }],
      fileUpload(FilePath.BANNER_IMAGES),
    ),
  )
  async imageUpdate(
    @Body() updateSettingDto: UpdateSettingDto,
    @UploadedFiles() files: { home_banner_image?: Express.Multer.File[] },
  ): Promise<Response> {
    const imageFile = files?.home_banner_image?.[0];

    const imagePath = imageFile
      ? FilePath.BANNER_IMAGES + '/' + imageFile.filename
      : null;

    return await this.settingService.imageUpdate(updateSettingDto, imagePath);
  }

  @Get('admin/settings')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Query('keys') keys?: string[]): Promise<Response> {
    return await this.settingService.findAll(keys);
  }

  @Get('settings')
  async getAll(@Query('keys') keys?: string[]): Promise<Response> {
    return await this.settingService.findAll(keys);
  }

  @Get('terms-condition')
  @Render('terms-condition')
  renderTerms() {
    return {};
  }

  @Get('privacy-policy')
  @Render('privacy-policy')
  getPrivacyPage() {
    return {};
  }
}
