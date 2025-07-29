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

  @Get('gst')
  async getGstExcelReport(
    @Query() reportFilterDto: ReportFilterDto,
  ): Promise<any> {
    const data = await this.reportService.getGstExcelReport(reportFilterDto);

    const fileUrl = await exportGstExcel(data);

    return { url: fileUrl };
  }

  @Get('pickup')
  async getPickupExcelReport(
    @Query() reportFilterDto: ReportFilterDto,
  ): Promise<any> {
    const data = await this.reportService.getPickupExcelReport(reportFilterDto);

    const fileUrl = await exportPickupExcel(data);

    return { url: fileUrl };
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
  async downloadExcelBuffer(
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
