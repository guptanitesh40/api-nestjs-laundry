import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Cart } from 'src/entities/cart.entity';
import { Price } from 'src/entities/price.entity';
import {
  appendBaseUrlToImages,
  appendBaseUrlToImagesCartItems,
} from 'src/utils/image-path.helper';
import { Repository } from 'typeorm';
import { AddCartDto } from './dto/cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

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

    const cartWithDetails = this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.category', 'category')
      .leftJoinAndSelect('cart.service', 'service')
      .leftJoinAndSelect('cart.product', 'product')
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
    const carts = await this.cartRepository
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

    const cartsWithImages = carts.map((cart) => {
      cart.product_image = appendBaseUrlToImages([
        { image: cart.product_image },
      ])[0].image;
      cart.service_image = appendBaseUrlToImages([
        { image: cart.service_image },
      ])[0].image;
      return cart;
    });

    return {
      statusCode: 200,
      message: 'Cart retrieved successfully',
      data: cartsWithImages,
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
