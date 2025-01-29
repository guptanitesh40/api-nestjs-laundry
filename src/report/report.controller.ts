import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from 'src/modules/auth/guard/role.guard';
import { ReportService } from './report.service';

@Controller('report')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
@Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('total-orders')
  async getTotalOrderReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
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
  ) {
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
  ) {
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
  ): Promise<Response> {
    return await this.reportService.getPaymentTransactionReport(
      startDate,
      endDate,
    );
  }
}
