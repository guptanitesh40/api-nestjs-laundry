import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilePath } from 'src/constants/FilePath';
import { Response } from 'src/dto/response.dto';
import { fileFieldsInterceptor } from 'src/utils/file-upload.helper';
import { RolesGuard } from '../auth/guard/role.guard';
import { CompanyFilterDto } from '../dto/company-filter.dto';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @UseInterceptors(fileFieldsInterceptor())
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      contract_document?: Express.Multer.File[];
    },
  ): Promise<Response> {
    const logoFile = files?.logo?.[0];
    const contractFile = files?.contract_document?.[0];

    if (!logoFile && !contractFile) {
      throw new HttpException(
        'Both logo and contract document must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    const logoPath = logoFile
      ? FilePath.COMPANY_LOGO + '/' + logoFile.filename
      : null;
    const contractDocumentPath = contractFile
      ? FilePath.CONTRACT_DOCUMENT + '/' + contractFile.filename
      : null;

    return await this.companyService.create(
      createCompanyDto,
      logoPath,
      contractDocumentPath,
    );
  }

  @Get()
  async findAll(
    @Query() companyFilterDto: CompanyFilterDto,
  ): Promise<Response> {
    return await this.companyService.findAll(companyFilterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Response> {
    return this.companyService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(fileFieldsInterceptor())
  async update(
    @Param('id') id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      contract_document?: Express.Multer.File[];
    },
  ): Promise<Response> {
    const logoFile = files?.logo?.[0];
    const contractFile = files?.contract_document?.[0];

    const logoPath = logoFile
      ? FilePath.COMPANY_LOGO + '/' + logoFile.filename
      : null;
    const contractDocumentPath = contractFile
      ? FilePath.CONTRACT_DOCUMENT + '/' + contractFile.filename
      : null;

    return await this.companyService.update(
      id,
      updateCompanyDto,
      logoPath,
      contractDocumentPath,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<Response> {
    return await this.companyService.delete(id);
  }
}
