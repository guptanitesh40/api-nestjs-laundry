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
    const pdf = await this.invoiceService.generateAndSaveInvoicePdf(order_id);
    if (!pdf) {
      throw new NotFoundException(
        `Invoice could not be generated for order ID ${order_id}`,
      );
    }
    return pdf;
  }

  @Get('refund/:order_id')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.CUSTOMER)
  async generateRefundReceipt(@Param('order_id') order_id: number) {
    const refund = await this.invoiceService.generateRefundReceipt(order_id);
    if (!refund) {
      throw new NotFoundException(
        `Refund Receipt could not be generated for order ID ${order_id}`,
      );
    }
    return refund;
  }
}
