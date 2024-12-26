import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
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
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer =
        await this.invoiceService.generateAndSaveInvoicePdf(order_id);
      if (!pdfBuffer) {
        throw new NotFoundException(
          `Invoice could not be generated for order ID ${order_id}`,
        );
      }

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice_${order_id}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new HttpException(
          `Unable to generate invoice for order ID ${order_id}: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
