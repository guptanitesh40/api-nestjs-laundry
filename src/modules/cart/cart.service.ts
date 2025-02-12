import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Cart } from 'src/entities/cart.entity';
import { Price } from 'src/entities/price.entity';
import {
  appendBaseUrlToImagesCartItems,
  appendBaseUrlToImagesOrPdf,
} from 'src/utils/image-path.helper';
import { Repository } from 'typeorm';
import { BranchService } from '../branch/branch.service';
import { SettingService } from '../settings/setting.service';
import { AddCartDto } from './dto/cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    private readonly settingService: SettingService,
    private readonly branchService: BranchService,
  ) {}

  async addToCart(addCartDto: AddCartDto, user_id: number): Promise<Response> {
    const cart = this.cartRepository.create({
      ...addCartDto,
      user_id,
    });

    const result = await this.cartRepository.save(cart);

    const cartWithDetails = this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.category', 'category')
      .leftJoinAndSelect('cart.service', 'service')
      .leftJoinAndSelect('cart.product', 'product')
      .innerJoinAndSelect(
        Price,
        'price',
        'cart.category_id = price.category_id AND cart.product_id = price.product_id AND cart.service_id = price.service_id AND price.deleted_at IS NULL',
      )
      .select([
        'cart.cart_id as cart_id',
        'cart.created_at as created_at',
        'cart.updated_at as updated_at',
        'cart.deleted_at as deleted_at',
        'cart.user_id as user_id',
        'cart.category_id as category_id',
        'cart.product_id as product_id',
        'cart.service_id as service_id',
        'cart.quantity as quantity',
        'cart.description as description',
        'category.category_id as category_id',
        'category.name as category_name',
        'service.service_id as service_id',
        'service.name as service_name',
        'service.image as service_image',
        'product.product_id as product_id',
        'product.name as product_name',
        'product.image as product_image',
        'price.price_id as price_id',
        'price.price as price',
      ])
      .where('cart.cart_id = :cart_id', { cart_id: result.cart_id });

    const cartitems = await cartWithDetails.getRawOne();

    const updatedCartItems = appendBaseUrlToImagesCartItems(
      [
        {
          ...cartitems,
          service_image: cartitems.service_image,
          product_image: cartitems.product_image,
        },
      ],
      ['service_image', 'product_image'],
    );

    const updatedCart = updatedCartItems[0];

    return {
      statusCode: 200,
      message: 'Cart added successfully',
      data: updatedCart,
    };
  }

  async getAllCarts(user_id: number): Promise<Response> {
    const cartsQuery = await this.cartRepository
      .createQueryBuilder('cart')
      .innerJoin('cart.category', 'category')
      .innerJoin('cart.product', 'product')
      .innerJoin('cart.service', 'service')
      .innerJoinAndSelect(
        Price,
        'price',
        'cart.category_id = price.category_id AND cart.product_id = price.product_id AND cart.service_id = price.service_id AND price.deleted_at IS NULL',
      )
      .where('user_id = :user_id', { user_id })
      .select([
        'cart.cart_id as cart_id',
        'cart.quantity as quantity',
        'cart.description as description',
        'cart.product_id as product_id',
        'product.name as product_name',
        'product.image as product_image',
        'cart.category_id as category_id',
        'category.name as category_name',
        'cart.service_id as service_id',
        'service.name as service_name',
        'service.image as service_image',
        'price.price_id as price_id',
        'price.price as price',
      ])
      .getRawMany();

    let subTotal = 0;

    const carts = cartsQuery.map((cart) => {
      cart.product_image = appendBaseUrlToImagesOrPdf([
        { image: cart.product_image },
      ])[0].image;
      cart.service_image = appendBaseUrlToImagesOrPdf([
        { image: cart.service_image },
      ])[0].image;

      subTotal += cart.price * cart.quantity;

      return cart;
    });

    const branches = (await this.branchService.getBranchList()).data;

    return {
      statusCode: 200,
      message: 'Cart retrieved successfully',
      data: { carts, branches, subTotal },
    };
  }

  async findAllCarts(user_id: number): Promise<Response> {
    const carts = (await this.getAllCarts(user_id)).data;

    const shippingCharge = (
      await this.settingService.findAll(['shipping_charge'])
    ).data;

    const shippingCharges = Number(shippingCharge.shipping_charge);
    const subTotal = carts.subTotal;
    const total = carts.subTotal + shippingCharges;

    return {
      statusCode: 200,
      message: 'Cart retrieved successfully',
      data: { carts, shippingCharges, subTotal, total },
    };
  }

  async updateCart(
    cart_id: number,
    updateCartDto: UpdateCartDto,
  ): Promise<Response> {
    await this.cartRepository.update(cart_id, updateCartDto);

    const cart = await this.cartRepository.findOne({
      where: { cart_id: cart_id },
    });

    return {
      statusCode: 200,
      message: 'Cart updated successfully',
      data: cart,
    };
  }

  async removeCart(cart_id: number): Promise<Response> {
    const cart = await this.cartRepository.findOne({
      where: { cart_id: cart_id },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.cartRepository.delete(cart_id);

    return {
      statusCode: 200,
      message: 'Cart removed successfully',
      data: null,
    };
  }

  async removeCartByUser(user_id: number): Promise<Response> {
    const cart = await this.cartRepository.findOne({
      where: { user_id: user_id },
    });

    await this.cartRepository.delete({ user_id: user_id });

    return {
      statusCode: 200,
      message: 'Cart removed successfully',
      data: cart,
    };
  }
}
