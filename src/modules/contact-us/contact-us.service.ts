import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { ContactUs } from 'src/entities/contact-us.entity';
import { Repository } from 'typeorm';
import { CreateContactUsDto } from './dto/create-contact-us.dto';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectRepository(ContactUs)
    private readonly contactUsRepository: Repository<ContactUs>,
  ) {}

  async createContact(
    createContactUsDto: CreateContactUsDto,
  ): Promise<Response> {
    const contact = this.contactUsRepository.create(createContactUsDto);
    const result = await this.contactUsRepository.save(contact);

    return {
      statusCode: 201,
      message: 'Your message has been sent successfully',
      data: result,
    };
  }
}
