import { Body, Controller, Post } from '@nestjs/common';
import { Response } from 'src/dto/response.dto';
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
}
