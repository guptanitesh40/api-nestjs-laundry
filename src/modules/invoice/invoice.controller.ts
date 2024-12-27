import {
  Controller,
  Get,
  NotFoundException,
  Param,
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
  async generateInvoice(@Param('order_id') order_id: number) {
    const pdfBuffer =
      await this.invoiceService.generateAndSaveInvoicePdf(order_id);
    if (!pdfBuffer) {
      throw new NotFoundException(
        `Invoice could not be generated for order ID ${order_id}`,
      );
    }
    return pdfBuffer;
  }
}
