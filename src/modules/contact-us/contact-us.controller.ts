import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Response } from 'src/dto/response.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';

@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  async createContact(
    @Body() createContactUsDto: CreateContactUsDto,
  ): Promise<Response> {
    return this.contactUsService.createContact(createContactUsDto);
  }

  @Get()
  async getAll(
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<Response> {
    return await this.contactUsService.getAll(paginationQueryDto);
  }
}
