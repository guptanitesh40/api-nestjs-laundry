import {
  BadRequestException,
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
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { createReadStream, writeFileSync } from 'fs';
import { join } from 'path';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { OrderDetail } from 'src/entities/order.entity';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from '../auth/guard/role.guard';
import { OrderFilterDto } from '../dto/orders-filter.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { CreateOrderDto } from './dto/create-order.dto';
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

  @Get('admin/orders/workshop')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async getAllWorkshopOrders(
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<Response> {
    return this.orderService.getAllAssignWorkshopOrders(paginationQueryDto);
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
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<Response> {
    const user = req.user;
    return this.orderService.getAll(user.user_id, paginationQuery);
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

  @Patch('admin/orders/pickup')
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

  @Delete('admin/order/:order_id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async deleteOrder(
    @Param('order_id', ParseIntPipe) order_id: number,
  ): Promise<Response> {
    return await this.orderService.delete(order_id);
  }

  @Post('refund')
  async refundOrder(
    @Body() refundOrderDto: RefundOrderDto,
  ): Promise<StreamableFile> {
    try {
      const order: OrderDetail =
        await this.orderService.createRefund(refundOrderDto);
      const pdfBuffer = await this.orderService.generateRefundReceipt(
        order.order_id,
      );

      const filePath = join(
        process.cwd(),
        `pdf/refund-receipt-${order.order_id}.pdf`,
      );

      writeFileSync(filePath, pdfBuffer);

      const file = createReadStream(filePath);

      return new StreamableFile(file, { type: 'application/pdf' });
    } catch (error) {
      throw new BadRequestException(
        `Failed to process refund: ${error.message}`,
      );
    }
  }
}
