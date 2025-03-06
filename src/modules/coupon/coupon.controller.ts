import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from '../auth/guard/role.guard';
import { CouponFiltrerDto } from '../dto/coupon-filter.dto';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ApplyCouponDto } from './dto/create.verify-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Controller()
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('admin/coupon')
  async create(@Body() createCouponDto: CreateCouponDto): Promise<Response> {
    return await this.couponService.create(createCouponDto);
  }

  @Get('admin/coupon')
  async findAll(
    @Query() couponFiltrerDto: CouponFiltrerDto,
  ): Promise<Response> {
    return this.couponService.findAll(couponFiltrerDto);
  }

  @Get('admin/valid-coupons')
  async findValidCoupons(@Query('user_id') user_id: number): Promise<Response> {
    return this.couponService.getAll(user_id);
  }

  @Get('customer/coupon')
  @Roles(Role.CUSTOMER)
  async getAll(@Request() req): Promise<Response> {
    const user = req.user;
    return this.couponService.getAll(user.user_id);
  }

  @Post('coupon/apply')
  @Roles(Role.CUSTOMER)
  async applyCoupon(
    @Body() applyCouponDto: ApplyCouponDto,
    @Request() req,
  ): Promise<Response> {
    const user = req.user;
    return this.couponService.applyCoupon(applyCouponDto, user.user_id);
  }

  @Post('admin/coupon/apply')
  async applyCouponForAdmin(
    @Body() applyCouponDto: ApplyCouponDto,
    @Query('user_id') user_id: number,
  ): Promise<Response> {
    return this.couponService.applyCoupon(applyCouponDto, user_id);
  }

  @Get('admin/coupon/:coupon_id')
  findOne(@Param('coupon_id') coupon_id: number): Promise<Response> {
    return this.couponService.findOne(coupon_id);
  }

  @Put('admin/coupon/:coupon_id')
  update(
    @Param('coupon_id') coupon_id: number,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<Response> {
    return this.couponService.update(coupon_id, updateCouponDto);
  }

  @Delete('admin/coupon/:coupon_id')
  async remove(@Param('coupon_id') coupon_id: number): Promise<Response> {
    return await this.couponService.remove(coupon_id);
  }
}
