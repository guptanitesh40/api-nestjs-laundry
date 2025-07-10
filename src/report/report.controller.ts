import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/modules/auth/guard/role.guard';
import {
  exportDeliveryExcel,
  exportGstExcel,
  exportNotActiveCutomerExcel,
  exportPaymentTransactionExcel,
  exportPickupExcel,
  exportRefundOrderExcel,
  exportTotalOrderExcel,
} from 'src/utils/reports-excel.helper';
import { ReportService } from './report.service';

@Controller('report')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('total-orders')
  async getTotalOrderReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('user_id') user_id?: number | number[],
    @Query('format') format?: string,
    @Query('company_id') company_id?: number | number[],
  ) {
    const userIds = Array.isArray(user_id)
      ? user_id.map(Number)
      : user_id
        ? String(user_id).split(',').map(Number)
        : undefined;

    const companyIds = Array.isArray(company_id)
      ? company_id.map(Number)
      : company_id
        ? String(company_id).split(',').map(Number)
        : undefined;

    if (format === 'excel') {
      const data = await this.reportService.getTotalOrderExcelReport(
        startDate,
        endDate,
        userIds,
        companyIds,
      );
      const fileUrl = await exportTotalOrderExcel(data);

      return { url: fileUrl };
    }

    return this.reportService.getTotalOrderReport(startDate, endDate);
  }

  @Get('delivery-completed-report')
  async getDeliveryCompletedReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getDeliveryCompletedReport(startDate, endDate);
  }

  @Get('delivery-pending-report')
  async getDeliveryPendingReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getDeliveryPendingReport(startDate, endDate);
  }

  @Get('delivery-report')
  async getDelievryReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getDeliveryReport(startDate, endDate);
  }

  @Get('payment-type-report')
  async getPaymentTypeReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getPaymentReport(startDate, endDate);
  }

  @Get('pending-amount-report')
  async getPendingAmountReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getPendingAmountReport(startDate, endDate);
  }

  @Get('refund-report')
  async getRefundReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format?: string,
    @Query('company_id') company_id?: number | number[],
  ) {
    const companyIds = Array.isArray(company_id)
      ? company_id.map(Number)
      : company_id
        ? String(company_id).split(',').map(Number)
        : undefined;

    if (format === 'excel') {
      const data = await this.reportService.getRefundExcelReport(
        startDate,
        endDate,
        companyIds,
      );
      const fileUrl = await exportRefundOrderExcel(data);

      return { url: fileUrl };
    }

    return this.reportService.getRefundReport(startDate, endDate);
  }

  @Get('kasar-report')
  async getKasarReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getKasarReport(startDate, endDate);
  }

  @Get('inactive-customer-report')
  async getInactiveCustomerReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format?: string,
    @Query('user_id') user_id?: number | number[],
    @Query('company_id') company_id?: number | number[],
  ) {
    const userIds = Array.isArray(user_id)
      ? user_id.map(Number)
      : user_id
        ? String(user_id).split(',').map(Number)
        : undefined;

    const companyIds = Array.isArray(company_id)
      ? company_id.map(Number)
      : company_id
        ? String(company_id).split(',').map(Number)
        : undefined;

    if (format === 'excel') {
      const data = await this.reportService.getNotActiveCustomerExcelReport(
        startDate,
        endDate,
        userIds,
        companyIds,
      );
      const fileUrl = await exportNotActiveCutomerExcel(data);

      return { url: fileUrl };
    }

    return this.reportService.getNotActiveCustomerReport(startDate, endDate);
  }

  @Get('new-customer-acquisition-report')
  async getNewCustomerAcquisitionReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getNewCustomerAcquisitionReport(
      startDate,
      endDate,
    );
  }

  @Get('customer-activity')
  async getCustomerActivityReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getCustomerActivityReport(startDate, endDate);
  }

  @Get('sales-booking')
  async getSalesBookingReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getSalesBookingReport(startDate, endDate);
  }

  @Get('customers-feedback')
  async getFeedbacks(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportService.getFeedbackTrends(startDate, endDate);
  }

  @Get('branch-wise-sales-collections')
  async getBranchWiseSalesAndCollectionReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('branch_id') branch_id?: number,
  ) {
    return this.reportService.getBranchWiseSalesAndCollectionsReport(
      startDate,
      endDate,
      branch_id,
    );
  }

  @Get('payment-transaction')
  async getPaymentTransactionReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format?: 'pdf' | 'excel',
    @Query('user_id') user_id?: number | number[],
    @Query('company_id') company_id?: number | number[],
  ): Promise<any> {
    const userIds = Array.isArray(user_id)
      ? user_id.map(Number)
      : user_id
        ? String(user_id).split(',').map(Number)
        : undefined;

    const companyIds = Array.isArray(company_id)
      ? company_id.map(Number)
      : company_id
        ? String(company_id).split(',').map(Number)
        : undefined;

    if (format === 'excel') {
      const data = await this.reportService.getPaymentTransactionExcelReport(
        startDate,
        endDate,
        userIds,
        companyIds,
      );

      const fileUrl = await exportPaymentTransactionExcel(data);

      return { url: fileUrl };
    }

    return await this.reportService.getPaymentTransactionReport(
      startDate,
      endDate,
    );
  }

  @Get('gst')
  async getGstExcelReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('user_id') user_id?: number | number[],
    @Query('company_id') company_id?: number | number[],
  ): Promise<any> {
    const userIds = Array.isArray(user_id)
      ? user_id.map(Number)
      : user_id
        ? String(user_id).split(',').map(Number)
        : undefined;

    const companyIds = Array.isArray(company_id)
      ? company_id.map(Number)
      : company_id
        ? String(company_id).split(',').map(Number)
        : undefined;
    const data = await this.reportService.getGstExcelReport(
      startDate,
      endDate,
      userIds,
      companyIds,
    );

    const fileUrl = await exportGstExcel(data);

    return { url: fileUrl };
  }

  @Get('pickup')
  async getPickupExcelReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('user_id') user_id?: number | number[],
    @Query('company_id') company_id?: number | number[],
  ): Promise<any> {
    const userIds = Array.isArray(user_id)
      ? user_id.map(Number)
      : user_id
        ? String(user_id).split(',').map(Number)
        : undefined;

    const companyIds = Array.isArray(company_id)
      ? company_id.map(Number)
      : company_id
        ? String(company_id).split(',').map(Number)
        : undefined;

    const data = await this.reportService.getPickupExcelReport(
      startDate,
      endDate,
      userIds,
      companyIds,
    );

    const fileUrl = await exportPickupExcel(data);

    return { url: fileUrl };
  }

  @Get('delivery')
  async getDeliveryExcelReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('user_id') user_id?: number | number[],
    @Query('company_id') company_id?: number | number[],
  ): Promise<any> {
    const userIds = Array.isArray(user_id)
      ? user_id.map(Number)
      : user_id
        ? String(user_id).split(',').map(Number)
        : undefined;

    const companyIds = Array.isArray(company_id)
      ? company_id.map(Number)
      : company_id
        ? String(company_id).split(',').map(Number)
        : undefined;

    const data = await this.reportService.getDeliveryExcelReport(
      startDate,
      endDate,
      userIds,
      companyIds,
    );

    const fileUrl = await exportDeliveryExcel(data);

    return { url: fileUrl };
  }

  @Get('branch-wise-summary')
  async getBranchWiseOrderSummary(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const user = req.user;
    return this.reportService.getBranchWiseOrderSummary(
      user,
      startDate,
      endDate,
    );
  }
}
