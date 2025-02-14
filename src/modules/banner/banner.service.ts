import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Banner } from 'src/entities/banner.entity';
import { appendBaseUrlToImagesOrPdf } from 'src/utils/image-path.helper';
import { Repository } from 'typeorm';
import { BannerFilterDto } from '../dto/banner-filter.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private BannerRepository: Repository<Banner>,
  ) {}

  async getAll(): Promise<Response> {
    const banner = await this.BannerRepository.find({
      where: { deleted_at: null },
    });

    const Banner = appendBaseUrlToImagesOrPdf(banner);

    return {
      statusCode: 200,
      message: 'banner retrieved successfully',
      data: { banner: Banner },
    };
  }

  async create(
    createBannerDto: CreateBannerDto,
    imagePath: string,
  ): Promise<Response> {
    const banner = this.BannerRepository.create({
      ...createBannerDto,
      image: imagePath,
    });

    const result = await this.BannerRepository.save(banner);
    const Banner = appendBaseUrlToImagesOrPdf([result])[0];
    return {
      statusCode: 201,
      message: 'banner added successfully',
      data: { result: Banner },
    };
  }

  async findAll(bannerFilterDto: BannerFilterDto): Promise<Response> {
    const { per_page, page_number, search, sort_by, order, banner_types } =
      bannerFilterDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    const queryBuilder = this.BannerRepository.createQueryBuilder('banner')
      .where('banner.deleted_at IS NULL')
      .take(perPage)
      .skip(skip);

    if (search) {
      queryBuilder.andWhere(
        '(banner.title LIKE :search OR banner.description LIKE :search OR banner.image LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (banner_types) {
      queryBuilder.andWhere('banner.banner_type In (:...bannerTypes)', {
        bannerTypes: banner_types,
      });
    }

    let sortColumn = 'banner.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      sortColumn = sort_by;
    }

    if (order) {
      sortOrder = order;
    }

    queryBuilder.orderBy(sortColumn, sortOrder);

    const [result, total] = await queryBuilder.getManyAndCount();
    const Banner = appendBaseUrlToImagesOrPdf(result);

    return {
      statusCode: 200,
      message: 'Banners retrieved successfully',
      data: {
        banner: Banner,
        limit: perPage,
        page_number: pageNumber,
        count: total,
      },
    };
  }

  async findOne(id: number): Promise<Response> {
    const banner = await this.BannerRepository.findOne({
      where: { banner_id: id, deleted_at: null },
    });
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    const Banner = appendBaseUrlToImagesOrPdf([banner])[0];
    return {
      statusCode: 200,
      message: 'Banner retrieved successfully',
      data: { banner: Banner },
    };
  }

  async update(
    id: number,
    updateBannerDto: UpdateBannerDto,
    imagePath?: string,
  ): Promise<Response> {
    const update_banner = await this.BannerRepository.findOne({
      where: { banner_id: id, deleted_at: null },
    });
    if (!update_banner) {
      return {
        statusCode: 404,
        message: 'banner not found',
        data: null,
      };
    }
    const updateData = {
      ...updateBannerDto,
    };

    if (imagePath) {
      updateData.image = imagePath;
    }

    await this.BannerRepository.update(id, updateData);

    Object.assign(update_banner, updateData);

    const Banner = appendBaseUrlToImagesOrPdf([update_banner])[0];

    return {
      statusCode: 200,
      message: 'banner updated successfully',
      data: { update_banner: Banner },
    };
  }

  async delete(id: number): Promise<Response> {
    const banner = await this.BannerRepository.findOne({
      where: { banner_id: id, deleted_at: null },
    });
    if (!banner) {
      return {
        statusCode: 404,
        message: 'banner not found',
        data: null,
      };
    }

    const Banner = appendBaseUrlToImagesOrPdf([banner])[0];
    banner.deleted_at = new Date();
    await this.BannerRepository.save(banner);

    return {
      statusCode: 200,
      message: 'Banner deleted successfully',
      data: { banner: Banner },
    };
  }
}
