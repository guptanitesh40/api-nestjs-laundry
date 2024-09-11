import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from '../auth/guard/role.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@Controller('order')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
@Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Response> {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  async findAll(): Promise<Response> {
    return this.orderService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Response> {
    return this.orderService.findOne(id);
  }

  @Put(':id')
  async updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Response> {
    return this.orderService.updateOrder(id, updateOrderDto);
  }

  @Post('/update-status/:id')
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: number,
  ): Promise<Response> {
    return this.orderService.updateOrderStatus(id, status);
  }

  @Post('/update-payment-status/:id')
  async updatePaymentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: number,
  ): Promise<Response> {
    return this.orderService.updatePaymentStatus(id, status);
  }

  @Post('/assign-delivery/:id')
  async assignDeliveryBoy(
    @Param('id', ParseIntPipe) id: number,
    @Body('delivery_boy_id') delivery_boy_id: number,
  ): Promise<Response> {
    return this.orderService.assignDeliveryBoy(id, delivery_boy_id);
  }
}
