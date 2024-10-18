import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Cart } from 'src/entities/cart.entity';
import { Price } from 'src/entities/price.entity';
import { Repository } from 'typeorm';
import { AddCartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async addToCart(addCartDto: AddCartDto, user_id: number): Promise<Response> {
    const cart = this.cartRepository.create({
      ...addCartDto,
      user_id,
    });

    const result = await this.cartRepository.save(cart);

    return {
      statusCode: 201,
      message: 'Cart added successfully',
      data: result,
    };
  }

  async getAllCarts(user_id: number): Promise<Response> {
    const BASE_URL = process.env.BASE_URL;
    const carts = await this.cartRepository
      .createQueryBuilder('cart')
      .innerJoin('cart.category', 'category')
      .innerJoin('cart.product', 'product')
      .innerJoin('cart.service', 'service')
      .innerJoinAndSelect(
        Price,
        'price',
        'cart.category_id = price.category_id AND cart.product_id = price.product_id AND cart.service_id = price.service_id and price.deleted_at is NULL',
      )
      .where('user_id = :user_id', {
        user_id,
      })
      .select([
        'cart.cart_id as cart_id',
        'cart.quantity as quantity',
        'cart.product_id as product_id',
        'product.name as product_name',
        `CONCAT('${BASE_URL}/', product.image) as product_image`,
        'cart.category_id as category_id',
        'category.name as category_name',
        'cart.service_id as service_id',
        'service.name as service_name',
        'price.price_id as price_id',
        'price.price as price',
      ])
      .getRawMany();

    return {
      statusCode: 200,
      message: 'Cart retrieved successfully',
      data: carts,
    };
  }

  async updateCart(cart_id: number, quantity: number): Promise<Response> {
    const cart = await this.cartRepository.findOne({
      where: { cart_id: cart_id },
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.quantity = quantity;

    const updated = await this.cartRepository.save(cart);

    return {
      statusCode: 200,
      message: 'Cart updated successfully',
      data: updated,
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
}
