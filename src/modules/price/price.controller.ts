import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { createReadStream, writeFileSync } from 'fs';
import { join } from 'path';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from '../auth/guard/role.guard';
import { CreatePriceDto } from './dto/create-price.dto';
import { PriceService } from './price.service';

@Controller('prices')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async create(@Body() createPriceDto: CreatePriceDto): Promise<Response> {
    return await this.priceService.create(createPriceDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async findAll(): Promise<Response> {
    return await this.priceService.findAll();
  }

  @Get('customer')
  @Roles(Role.CUSTOMER)
  async getAll(@Request() req): Promise<Response> {
    const user = req.user;
    return await this.priceService.getAll(user.user_id);
  }

  @Post('download-pdf')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async downloadPDF(): Promise<StreamableFile> {
    const pdfBuffer = await this.priceService.generatePriceListPDF();

    const filePath = join(process.cwd(), 'pdf/priceList.pdf');
    writeFileSync(filePath, pdfBuffer);

    const file = createReadStream(filePath);
    return new StreamableFile(file, { type: 'application/pdf' });
  }
}
