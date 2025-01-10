import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilePath } from 'src/constants/FilePath';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { CustomerOrderStatuseLabel } from 'src/enum/customer_order_status_label.enum';
import { Role } from 'src/enum/role.enum';
import { fileUpload } from 'src/multer/image-upload';
import { RolesGuard } from '../auth/guard/role.guard';
import { OrderFilterDto } from '../dto/orders-filter.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { DeliveryOrderDto } from './dto/delivery-order.dto';
import { RefundOrderDto } from './dto/refund-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@Controller()
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('orders/assigned')
  @Roles(Role.DELIVERY_BOY)
  async getAssignedOrders(
    @Request() req,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<Response> {
    const user = req.user;

    return await this.orderService.getAssignedOrders(
      user.user_id,
      paginationQuery.search,
    );
  }

  @Get('orders/invoice-list')
  @Roles(Role.CUSTOMER)
  async getOrderInvoiceList(@Request() req): Promise<Response> {
    const user = req.user;

    return this.orderService.getOrderInvoiceList(user.user_id);
  }

  @Post('orders/customer/clear-due')
  @Roles(Role.CUSTOMER)
  async clearCustomerDue(
    @Request() req,
    @Body('pay_amount') pay_amount: number,
    @Body('payment_status') payment_status: number,
    @Body('transaction_id') transaction_id: string,
  ): Promise<Response> {
    const user = req.user;
    return this.orderService.clearCustomerDue(
      user.user_id,
      pay_amount,
      payment_status,
      transaction_id,
    );
  }

  @Post('orders/cancel')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async cancelOrder(@Body() cancelOrderDto, @Request() req): Promise<Response> {
    const user = req.user;
    return this.orderService.cancelOrder(cancelOrderDto, user.user_id);
  }

  @Get('admin/orders/workshop')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async getAllWorkshopOrders(
    @Query() orderFilterDto: OrderFilterDto,
  ): Promise<Response> {
    return this.orderService.getAllAssignWorkshopOrders(orderFilterDto);
  }

  @Post('orders')
  @Roles(Role.CUSTOMER)
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Response> {
    return this.orderService.create(createOrderDto);
  }

  @Get('admin/orders/:order_id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async getOrderDetails(
    @Param('order_id') order_id: number,
  ): Promise<Response> {
    return this.orderService.getOrderDetail(order_id);
  }

  @Get('orders/:order_id')
  @Roles(Role.CUSTOMER)
  async getOrderDetail(@Param('order_id') order_id: number): Promise<Response> {
    return this.orderService.getOrderDetail(order_id);
  }

  @Get('orders')
  @Roles(Role.CUSTOMER)
  async getCustomerOrders(
    @Request() req,
    @Query('orderStatus') orderStatus: CustomerOrderStatuseLabel,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<Response> {
    const user = req.user;
    return this.orderService.getAll(user.user_id, paginationQuery, orderStatus);
  }

  @Post('admin/orders')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async createorder(
    @Request() req,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<Response> {
    const admin_id = req.user;

    return this.orderService.createAdminOrder(createOrderDto, admin_id.user_id);
  }

  @Get('admin/orders')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async findAll(@Query() orderFilterDto: OrderFilterDto): Promise<Response> {
    return this.orderService.findAll(orderFilterDto);
  }

  @Get('admin/order/:order_id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async findOne(
    @Param('order_id', ParseIntPipe) order_id: number,
  ): Promise<Response> {
    return this.orderService.findOne(order_id);
  }

  @Put('admin/orders/:id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Response> {
    return this.orderService.updateOrder(id, updateOrderDto);
  }

  @Patch('admin/orders/:order_id/update-status')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async updateOrderStatus(
    @Param('order_id') orderId: number,
    @Body() updateOrderStatusDto: UpdateOrderDto,
  ): Promise<any> {
    const { order_status } = updateOrderStatusDto;
    return this.orderService.updateOrderStatus(orderId, order_status);
  }

  @Patch('admin/orders/:order_id/update-payment-status')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async updatePaymentStatus(
    @Param('order_id', ParseIntPipe) order_id: number,
    @Body('status') status: number,
  ): Promise<Response> {
    return this.orderService.updatePaymentStatus(order_id, status);
  }

  @Patch('admin/orders/assign-pickup')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async assignPickupBoy(
    @Body('order_id', ParseIntPipe) order_id: number,
    @Body('pickup_boy_id', ParseIntPipe) pickup_boy_id: number,
    @Body('comment') comment: string,
  ): Promise<Response> {
    return this.orderService.assignPickupBoy(order_id, pickup_boy_id, comment);
  }

  @Patch('admin/orders/assign-workshop')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async assignWorkshop(
    @Body('order_id', ParseIntPipe) order_id: number,
    @Body('workshop_id', ParseIntPipe) workshop_id: number,
  ): Promise<Response> {
    return this.orderService.assignWorkshop(order_id, workshop_id);
  }

  @Patch('admin/orders/assign-delivery')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async assignDeliveryBoy(
    @Body('order_id', ParseIntPipe) order_id: number,
    @Body('delivery_boy_id', ParseIntPipe) delivery_boy_id: number,
  ): Promise<Response> {
    return this.orderService.assignDeliveryBoy(order_id, delivery_boy_id);
  }

  @Patch('admin/orders/assign-branch')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async assignBranch(
    @Body('order_id', ParseIntPipe) order_id: number,
    @Body('branch_id', ParseIntPipe) branch_id: number,
  ): Promise<Response> {
    return this.orderService.assignBranch(order_id, branch_id);
  }

  @Patch('order/:order_id/complete-delivery')
  @Roles(Role.DELIVERY_BOY)
  @UseInterceptors(
    FilesInterceptor('images', 5, fileUpload(FilePath.NOTE_IMAGES)),
  )
  async deliveryComplete(
    @Param('order_id') order_id: number,
    @Request() req,
    @Body() deliveryOrderDto: DeliveryOrderDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Response> {
    const user = req.user;
    const imagePaths = files.map(
      (file) => `${FilePath.NOTE_IMAGES}/${file.filename}`,
    );
    return this.orderService.deliveryComplete(
      user.user_id,
      order_id,
      deliveryOrderDto,
      imagePaths,
    );
  }

  @Patch('order/:order_id/complete-pickup')
  @Roles(Role.DELIVERY_BOY)
  @UseInterceptors(
    FilesInterceptor('images', 5, fileUpload(FilePath.NOTE_IMAGES)),
  )
  async pickupComplete(
    @Param('order_id') order_id: number,
    @Request() req,
    @Body() deliveryOrderDto: DeliveryOrderDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Response> {
    const user = req.user;
    const imagePaths = files.map(
      (file) => `${FilePath.NOTE_IMAGES}/${file.filename}`,
    );

    return this.orderService.pickupComplete(
      user.user_id,
      order_id,
      deliveryOrderDto,
      imagePaths,
    );
  }

  @Delete('admin/order/:order_id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async deleteOrder(
    @Param('order_id', ParseIntPipe) order_id: number,
  ): Promise<Response> {
    return await this.orderService.delete(order_id);
  }

  @Post('refund')
  async refundOrder(@Body() refundOrderDto: RefundOrderDto): Promise<Response> {
    return await this.orderService.createRefund(refundOrderDto);
  }

  @Post('orders/payments/clear-due')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN)
  async payDueAmount(
    @Body('user_id') user_id: number,
    @Body() body: { orders: any[] },
  ): Promise<Response> {
    return await this.orderService.payDueAmount(user_id, body.orders);
  }
}
