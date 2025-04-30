import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from '../auth/guard/role.guard';
import { InvoiceService } from './invoice.service';

@Controller('pdf')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get('invoice/:order_id')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.CUSTOMER)
  async generateInvoice(
    @Param('order_id') order_id: number,
    @Query('regenerate') regenerate: string,
  ) {
    const pdf = await this.invoiceService.generateAndSaveInvoicePdf(
      order_id,
      regenerate,
    );
    if (!pdf) {
      throw new NotFoundException(
        `Invoice could not be generated for order ID ${order_id}`,
      );
    }
    return pdf;
  }

  @Get('prices/download-pdf')
  async downloadPDF() {
    const pdf = await this.invoiceService.generatePriceListPDF();
    if (!pdf) {
      throw new NotFoundException('price list pdf could not be generates');
    }

    return pdf;
  }
}
