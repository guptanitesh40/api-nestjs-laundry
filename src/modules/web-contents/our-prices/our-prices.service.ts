import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { OurPrice } from 'src/entities/our-price.entity';
import { Repository } from 'typeorm';
import { CreateOurPriceDto } from './dto/create-our-prices.dto';
import { UpdateOurPriceDto } from './dto/update-our-services.dto';

@Injectable()
export class OurPriceService {
  constructor(
    @InjectRepository(OurPrice)
    private ourPriceRepository: Repository<OurPrice>,
  ) {}

  async create(createOurPriceDto: CreateOurPriceDto): Promise<Response> {
    const price = this.ourPriceRepository.create(createOurPriceDto);
    const ourPrice = await this.ourPriceRepository.save(price);

    return {
      statusCode: 201,
      message: 'Our Price added successfully',
      data: { result: ourPrice },
    };
  }

  async findAll(): Promise<Response> {
    const queryBuilder = this.ourPriceRepository
      .createQueryBuilder('our-price')
      .where('our-price.deleted_at IS NULL');

    const result = await queryBuilder.getMany();

    return {
      statusCode: 200,
      message: 'Our Prices Retrived successfully',
      data: result,
    };
  }

  async update(
    id: number,
    updateOurPriceDto: UpdateOurPriceDto,
  ): Promise<Response> {
    const our_price = this.ourPriceRepository.findOne({
      where: { our_price_id: id },
    });

    if (!our_price) {
      return {
        statusCode: 404,
        message: 'Our price not found',
        data: null,
      };
    }

    await this.ourPriceRepository.update(id, updateOurPriceDto);

    Object.assign(our_price, updateOurPriceDto);

    return {
      statusCode: 200,
      message: 'Our Price Updated Successfully',
      data: our_price,
    };
  }

  async delete(id: number): Promise<Response> {
    const our_price = await this.ourPriceRepository.findOne({
      where: { our_price_id: id },
    });

    if (!our_price) {
      return {
        statusCode: 404,
        message: 'Our price not found',
        data: null,
      };
    }

    our_price.deleted_at = new Date();

    await this.ourPriceRepository.save(our_price);

    return {
      statusCode: 200,
      message: 'Our Price Deleted Successfully',
      data: our_price,
    };
  }
}
