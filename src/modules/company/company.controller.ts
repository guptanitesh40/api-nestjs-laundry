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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FilePath } from 'src/constants/FilePath';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { fileUpload } from 'src/multer/image-upload';
import { pdfUpload } from 'src/multer/pdf-upload';
import { RolesGuard } from '../auth/guard/role.guard';
import { CompanyFilterDto } from '../dto/company-filter.dto';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
@Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'contract_document', maxCount: 1 },
      ],
      {
        storage: fileUpload(FilePath.COMPANY_LOGO).storage,
        limits: {
          fileSize: Math.max(
            fileUpload(FilePath.COMPANY_LOGO).limits.fileSize,
            pdfUpload(FilePath.CONTRACT_DOCUMENT).limits.fileSize,
          ),
        },
        fileFilter: (req, file, cb) => {
          if (file.fieldname === 'logo') {
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
          } else if (file.fieldname === 'contract_document') {
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
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'contract_document', maxCount: 1 },
      ],
      {
        storage: fileUpload(FilePath.COMPANY_LOGO).storage,
        limits: {
          fileSize: Math.max(
            fileUpload(FilePath.COMPANY_LOGO).limits.fileSize,
            pdfUpload(FilePath.CONTRACT_DOCUMENT).limits.fileSize,
          ),
        },
        fileFilter: (req, file, cb) => {
          if (file.fieldname === 'logo') {
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
          } else if (file.fieldname === 'contract_document') {
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
