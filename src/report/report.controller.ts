import {
  Controller,
  Get,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

import { RolesGuard } from 'src/modules/auth/guard/role.guard';
import {
  exportDeliveryExcel,
  exportGstExcel,
  exportNotActiveCutomerExcel,
  exportPaymentTransactionExcel,
  exportPickupExcel,
  exportRefundOrderExcel,
  exportServiceWiseExcel,
  exportTotalOrderExcel,
} from 'src/utils/reports-excel.helper';
import { ReportFilterDto } from './dto/report-filter.dto';
import { ReportService } from './report.service';

@Controller('report')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('total-orders')
  async getTotalOrderReport(@Query() reportFilterDto: ReportFilterDto) {
    if (reportFilterDto.format === 'excel') {
      const data =
        await this.reportService.getTotalOrderExcelReport(reportFilterDto);
      const fileUrl = await exportTotalOrderExcel(data);

      return { url: fileUrl };
    }

    return this.reportService.getTotalOrderReport(reportFilterDto);
  }

  @Get('total-orders/download')
  async downloadTotalOrderExcelBuffer(
    @Query() dto: ReportFilterDto,
    @Res() res: Response,
  ): Promise<any> {
    const { data: rows, totals } =
      await this.reportService.getTotalOrderExcelReport(dto);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Total Orders');

    worksheet.columns = [
      { header: 'ID', key: 'order_id' },
      { header: 'Branch', key: 'branch' },
      { header: 'Customer Name', key: 'customer_name' },
      { header: 'Booking Date', key: 'booking_date' },
      { header: 'Delivery Date', key: 'delivery_date' },
      { header: 'Paid Amount', key: 'paid_amount' },
      { header: 'Total Amount', key: 'total_amount' },
      { header: 'Pending Amount', key: 'pending_amount' },
      { header: 'Kasar Amount', key: 'kasar_amount' },
    ];

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    worksheet.addRows(rows);

    worksheet.addRow([]);

    worksheet.addRow([
      totals.total_orders,
      '',
      '',
      '',
      '',
      totals.paid_amount,
      totals.total_amount,
      totals.pending_amount,
      totals.kasar_amount,
    ]);

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Total-orders-Report.xlsx',
    );
    res.send(buffer);
  }

  @Get('delivery-completed-report')
  async getDeliveryCompletedReport(@Query() reportFilterDto: ReportFilterDto) {
    return this.reportService.getDeliveryCompletedReport(reportFilterDto);
  }

  @Get('delivery-pending-report')
  async getDeliveryPendingReport(@Query() reportFilterDto: ReportFilterDto) {
    return this.reportService.getDeliveryPendingReport(reportFilterDto);
  }

  @Get('delivery-report')
  async getDelievryReport(@Query() reportFilterDto: ReportFilterDto) {
    return this.reportService.getDeliveryReport(reportFilterDto);
  }

  @Get('payment-type-report')
  async getPaymentTypeReport(@Query() reportFilterDto: ReportFilterDto) {
    return this.reportService.getPaymentReport(reportFilterDto);
  }

  @Get('pending-amount-report')
  async getPendingAmountReport(@Query() reportFilterDto: ReportFilterDto) {
    return this.reportService.getPendingAmountReport(reportFilterDto);
  }

  @Get('refund-report')
  async getRefundReport(@Query() reportFilterDto: ReportFilterDto) {
    if (reportFilterDto.format === 'excel') {
      const data =
        await this.reportService.getRefundExcelReport(reportFilterDto);
      const fileUrl = await exportRefundOrderExcel(data);

      return { url: fileUrl };
    }

    return this.reportService.getRefundReport(reportFilterDto);
  }

  @Get('refund-report/download')
  async downloadRefundExcelBuffer(
    @Query() dto: ReportFilterDto,
    @Res() res: Response,
  ) {
    const data = await this.reportService.getRefundExcelReport(dto);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Refund');

    worksheet.columns = [
      { header: 'Order Number', key: 'order_id' },
      { header: 'Company', key: 'company' },
      { header: 'Branch', key: 'branch' },
      { header: 'Customer Name', key: 'customer_name' },
      { header: 'Customer Address', key: 'address_details' },
    ];

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    worksheet.addRows(data);

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=refund-Report.xlsx',
    );
    res.send(buffer);
  }

  @Get('kasar-report')
  async getKasarReport(@Query() reportFilterDto: ReportFilterDto) {
    return this.reportService.getKasarReport(reportFilterDto);
  }

  @Get('inactive-customer-report')
  async getInactiveCustomerReport(@Query() reportFilterDto: ReportFilterDto) {
    if (reportFilterDto.format === 'excel') {
      const data =
        await this.reportService.getNotActiveCustomerExcelReport(
          reportFilterDto,
        );
      const fileUrl = await exportNotActiveCutomerExcel(data);

      return { url: fileUrl };
    }

    return this.reportService.getNotActiveCustomerReport(reportFilterDto);
  }

  @Get('inactive-customer-report/download')
  async downloadNotActiveCustomerExcelBuffer(
    @Query() dto: ReportFilterDto,
    @Res() res: Response,
  ) {
    const data = await this.reportService.getNotActiveCustomerExcelReport(dto);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Not Active Customer');

    worksheet.columns = [
      { header: 'Order Number', key: 'order_id' },
      { header: 'Company', key: 'company' },
      { header: 'Branch', key: 'branch' },
      { header: 'Customer Name', key: 'customer_name' },
      { header: 'Customer Address', key: 'address_details' },
    ];

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    worksheet.addRows(data);

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Not-Active-Customer-Report.xlsx',
    );
    res.send(buffer);
  }

  @Get('new-customer-acquisition-report')
  async getNewCustomerAcquisitionReport(
    @Query() reportFilterDto: ReportFilterDto,
  ) {
    return this.reportService.getNewCustomerAcquisitionReport(reportFilterDto);
  }

  @Get('customer-activity')
  async getCustomerActivityReport(@Query() reportFilterDto: ReportFilterDto) {
    return this.reportService.getCustomerActivityReport(reportFilterDto);
  }

  @Get('sales-booking')
  async getSalesBookingReport(@Query() reportFilterDto: ReportFilterDto) {
    return this.reportService.getSalesBookingReport(reportFilterDto);
  }

  @Get('customers-feedback')
  async getFeedbacks(@Query() reportFilterDto: ReportFilterDto) {
    return this.reportService.getFeedbackTrends(reportFilterDto);
  }

  @Get('branch-wise-sales-collections')
  async getBranchWiseSalesAndCollectionReport(
    @Query() reportFilterDto: ReportFilterDto,
  ) {
    return this.reportService.getBranchWiseSalesAndCollectionsReport(
      reportFilterDto,
    );
  }

  @Get('payment-transaction')
  async getPaymentTransactionReport(
    @Query() reportFilterDto: ReportFilterDto,
  ): Promise<any> {
    if (reportFilterDto.format === 'excel') {
      const data =
        await this.reportService.getPaymentTransactionExcelReport(
          reportFilterDto,
        );

      const fileUrl = await exportPaymentTransactionExcel(data);

      return { url: fileUrl };
    }

    return await this.reportService.getPaymentTransactionReport(
      reportFilterDto,
    );
  }

  @Get('payment-transaction/download')
  async downloadPaymentTransactionExcelBuffer(
    @Query() dto: ReportFilterDto,
    @Res() res: Response,
  ) {
    const data = await this.reportService.getGstExcelReport(dto);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payment Transaction');

    worksheet.columns = [
      { header: 'ID', key: 'order_id' },
      { header: 'Company', key: 'company' },
      { header: 'Branch', key: 'branch' },
      { header: 'Customer Name', key: 'customer_name' },
      { header: 'Total Amount', key: 'total_amount' },
      { header: 'Payment Status', key: 'payment_status' },
      { header: 'Payment Type', key: 'payment_type' },
      { header: 'Transaction Id', key: 'transaction_id' },
    ];

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    worksheet.addRows(data);

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Transaction-Report.xlsx',
    );
    res.send(buffer);
  }

  @Get('gst')
  async getGstExcelReport(
    @Query() reportFilterDto: ReportFilterDto,
  ): Promise<any> {
    const data = await this.reportService.getGstExcelReport(reportFilterDto);

    const fileUrl = await exportGstExcel(data);

    return { url: fileUrl };
  }

  @Get('gst/download')
  async downloadGstExcelBuffer(
    @Query() dto: ReportFilterDto,
    @Res() res: Response,
  ) {
    const data = await this.reportService.getGstExcelReport(dto);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Gst');

    worksheet.columns = [
      { header: 'Order Number', key: 'order_id' },
      { header: 'Company', key: 'company' },
      { header: 'Branch', key: 'branch' },
      { header: 'Customer Name', key: 'customer_name' },
      { header: 'Customer Address', key: 'address_details' },
    ];

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    worksheet.addRows(data);

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Gst-Report.xlsx',
    );
    res.send(buffer);
  }

  @Get('pickup')
  async getPickupExcelReport(
    @Query() reportFilterDto: ReportFilterDto,
  ): Promise<any> {
    const data = await this.reportService.getPickupExcelReport(reportFilterDto);

    const fileUrl = await exportPickupExcel(data);

    return { url: fileUrl };
  }

  @Get('pickup/download')
  async downloadPickupExcelBuffer(
    @Query() dto: ReportFilterDto,
    @Res() res: Response,
  ): Promise<any> {
    const { data: rows, totals } =
      await this.reportService.getPickupExcelReport(dto);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pickup');

    worksheet.columns = [
      { header: 'Pickup Date', key: 'pickup_date' },
      { header: 'Pickup Done By', key: 'pickup_boy_name' },
      { header: 'Order Number', key: 'order_id' },
      { header: 'Branch', key: 'branch' },
      { header: 'Customer Name', key: 'customer_name' },
      { header: 'Total Amount', key: 'total_amount' },
      { header: 'Paid Amount', key: 'paid_amount' },
      { header: 'Pending Amount', key: 'pending_amount' },
      { header: 'Payment Status', key: 'payment_status' },
      { header: 'Kasar Amount', key: 'kasar_amount' },
      { header: 'Delivery Collect Amount', key: 'delivery_collect_amount' },
    ];

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    worksheet.addRows(rows);

    worksheet.addRow([]);

    worksheet.addRow([
      '',
      '',
      totals.total_orders,
      '',
      '',
      totals.total_amount,
      totals.paid_amount,
      totals.pending_amount,
      '',
      totals.kasar_amount,
      '',
    ]);

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Pickup-Report.xlsx',
    );
    res.send(buffer);
  }

  @Get('delivery')
  async getDeliveryExcelReport(
    @Query() reportFilterDto: ReportFilterDto,
  ): Promise<any> {
    const data =
      await this.reportService.getDeliveryExcelReport(reportFilterDto);

    const fileUrl = await exportDeliveryExcel(data);

    return { url: fileUrl };
  }

  @Get('delivery/download')
  async downloadDeliveryExcelBuffer(
    @Query() dto: ReportFilterDto,
    @Res() res: Response,
  ) {
    const { data: rows, totals } =
      await this.reportService.getDeliveryExcelReport(dto);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Service Wise Report');

    worksheet.columns = [
      { header: 'Delivery Date', key: 'delivery_date' },
      { header: 'Delivery Done By', key: 'delivery_boy_name' },
      { header: 'Order Number', key: 'order_id' },
      { header: 'Branch', key: 'branch' },
      { header: 'Customer Name', key: 'customer_name' },
      { header: 'Order Number', key: 'order_id' },
      { header: 'Customer Company Name', key: 'customer_company_name' },
      { header: 'Customer Address', key: 'address_details' },
      { header: 'Total Amount', key: 'total_amount' },
      { header: 'Paid Amount', key: 'paid_amount' },
      { header: 'Pending Amount', key: 'pending_amount' },
      { header: 'Payment Status', key: 'payment_status' },
      { header: 'Kasar Amount', key: 'kasar_amount' },
      { header: 'Delivery Collect Amount', key: 'delivery_collect_amount' },
    ];

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    worksheet.addRows(rows);

    worksheet.addRow([]);

    worksheet.addRow([
      '',
      '',
      totals.total_orders,
      '',
      '',
      '',
      '',
      '',
      totals.total_amount,
      totals.paid_amount,
      totals.pending_amount,
      '',
      totals.kasar_amount,
      totals.delivery_collect_amount,
    ]);

    const lastRow = worksheet.lastRow;
    if (lastRow) {
      lastRow.eachCell((cell) => {
        cell.font = { bold: true };
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Delivery-Report.xlsx',
    );
    res.send(buffer);
  }

  @Get('branch-wise-summary')
  async getBranchWiseOrderSummary(
    @Request() req,
    @Query() reportFilterDto: ReportFilterDto,
  ) {
    const user = req.user;
    return this.reportService.getBranchWiseOrderSummary(user, reportFilterDto);
  }

  @Get('service-wise-report')
  async getServiceWiseReport(@Query() dto: ReportFilterDto) {
    const data = await this.reportService.getServiceWiseReport(dto);

    const fileUrl = await exportServiceWiseExcel(data);

    return { url: fileUrl };
  }

  @Get('service-wise-report/download')
  async downloadServiceWiseExcelBuffer(
    @Query() dto: ReportFilterDto,
    @Res() res: Response,
  ) {
    const data = await this.reportService.getServiceWiseReport(dto);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Service Wise Report');

    worksheet.columns = [
      { header: 'Branch', key: 'branch' },
      { header: 'Service', key: 'service' },
      { header: 'Total Quantity', key: 'total_quantity' },
      { header: 'Total Amount', key: 'total_amount' },
      { header: 'Paid Amount', key: 'paid_amount' },
      { header: 'Pending Amount', key: 'pending_amount' },
    ];

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    worksheet.addRows(data);

    const totalRow = {
      branch: '',
      service: '',
      total_quantity: 0,
      total_amount: 0,
      paid_amount: 0,
      pending_amount: 0,
    };

    data.forEach((row) => {
      totalRow.total_quantity += Number(row.total_quantity || 0);
      totalRow.total_amount += Number(row.total_amount || 0);
      totalRow.paid_amount += Number(row.paid_amount || 0);
      totalRow.pending_amount += Number(row.pending_amount || 0);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Service-Wise-Report.xlsx',
    );
    res.send(buffer);
  }
}
