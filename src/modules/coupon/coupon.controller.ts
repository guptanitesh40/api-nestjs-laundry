import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from '../auth/guard/role.guard';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ApplyCouponDto } from './dto/create.verify-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Controller()
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
@Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('admin/coupon')
  async create(@Body() createCouponDto: CreateCouponDto): Promise<Response> {
    return await this.couponService.create(createCouponDto);
  }

  @Get('admin/coupon')
  async findAll(
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<Response> {
    return this.couponService.findAll(paginationQueryDto);
  }

  @Post('coupon/apply')
  @Roles(Role.CUSTOMER)
  async applyCoupon(
    @Body() applyCouponDto: ApplyCouponDto,
    @Param('userId') userId: number,
  ): Promise<Response> {
    return this.couponService.applyCoupon(applyCouponDto, userId);
  }

  @Post('admin/coupon/apply')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async applyCouponForAdmin(
    @Body() applyCouponDto: ApplyCouponDto,
    @Param('userId') userId: number,
  ): Promise<Response> {
    return this.couponService.applyCoupon(applyCouponDto, userId);
  }

  @Get('admin/coupon/:coupon_id')
  findOne(@Param('coupon_id') coupon_id: number): Promise<Response> {
    return this.couponService.findOne(coupon_id);
  }

  @Put('admin/coupon/:id')
  update(
    @Param('id') id: number,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<Response> {
    return this.couponService.update(id, updateCouponDto);
  }

  @Delete('admin/coupon/:id')
  async remove(@Param('id') id: number): Promise<Response> {
    return await this.couponService.remove(id);
  }
}
