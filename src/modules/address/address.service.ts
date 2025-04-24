import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { UserAddress } from 'src/entities/address.entity';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-addresses.dto';
import { UpdateUserAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(UserAddress)
    private userAddressRepository: Repository<UserAddress>,
  ) {}

  async getAll(user_id: number): Promise<Response> {
    const result = await this.userAddressRepository.find({
      where: { user_id: user_id, deleted_at: null },
    });

    return {
      statusCode: 200,
      message: 'Addresses retrieved successfully',
      data: { result },
    };
  }

  async setDefaultAddress(
    user_id: number,
    address_id: number,
  ): Promise<Response> {
    await this.userAddressRepository.update(
      { user_id: user_id },
      { is_default: false },
    );

    const updated = await this.userAddressRepository.update(
      { user_id: user_id, address_id: address_id },
      { is_default: true },
    );

    if (updated.affected === 0) {
      return {
        statusCode: 404,
        message: 'Address not found',
        data: null,
      };
    }
    const address = await this.userAddressRepository.findOne({
      where: { address_id },
    });

    return {
      statusCode: 200,
      message: 'Default address updated successfully',
      data: address,
    };
  }

  async findOne(user_id: number, id: number): Promise<Response> {
    const result = await this.userAddressRepository.findOne({
      where: { address_id: id, user_id: user_id, deleted_at: null },
    });

    if (!result) {
      throw new NotFoundException('Address not found');
    }

    return {
      statusCode: 200,
      message: 'Address retrieved successfully',
      data: { result },
    };
  }

  async create(
    user_id: number,
    createAddressdto: CreateAddressDto,
  ): Promise<Response> {
    const newAddress = this.userAddressRepository.create({
      ...createAddressdto,
      user_id: user_id,
    });
    const result = await this.userAddressRepository.save(newAddress);

    return {
      statusCode: 201,
      message: 'Address added successfully',
      data: { result },
    };
  }

  async createAdminAddress(
    createAddressdto: CreateAddressDto,
  ): Promise<Response> {
    const newAddress = this.userAddressRepository.create({
      ...createAddressdto,
    });
    const result = await this.userAddressRepository.save(newAddress);

    return {
      statusCode: 201,
      message: 'Address added successfully',
      data: { result },
    };
  }

  async update(
    user_id: number,
    id: number,
    updateAddressdto: UpdateUserAddressDto,
  ): Promise<Response> {
    const address = await this.userAddressRepository.findOne({
      where: { address_id: id, user_id: user_id, deleted_at: null },
    });

    if (!address) {
      return {
        statusCode: 404,
        message: 'Address not found',
        data: null,
      };
    }

    await this.userAddressRepository.update(id, updateAddressdto);

    const updatedAddress = await this.userAddressRepository.findOne({
      where: { address_id: id, user_id: user_id, deleted_at: null },
    });

    return {
      statusCode: 200,
      message: 'Address updated successfully',
      data: { updatedAddress },
    };
  }

  async delete(user_id: number, id: number): Promise<Response> {
    const address = await this.userAddressRepository.findOne({
      where: {
        address_id: id,
        user_id: user_id,
        deleted_at: null,
      },
    });

    if (!address) {
      return {
        statusCode: 404,
        message: 'Address not found',
        data: null,
      };
    }

    address.deleted_at = new Date();
    await this.userAddressRepository.save(address);

    return {
      statusCode: 200,
      message: 'Address deleted successfully',
      data: address,
    };
  }

  async getDefaultAddress(user_id: number) {
    const address = await this.userAddressRepository.findOne({
      where: {
        is_default: true,
        user_id: user_id,
        deleted_at: null,
      },
    });

    return address;
  }
}
