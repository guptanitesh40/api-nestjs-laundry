import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateLaundryBranchDto } from './dto/create-laundry-branch.dto';
import { UpdateLaundryBranchDto } from './dto/update-laundry-branch.dto';
import { LaundryBranchService } from './laundry-branch.service';

@Controller('laundry-branches')
export class LaundryBranchController {
  constructor(private readonly branchService: LaundryBranchService) {}

  @Post()
  async create(@Body() dto: CreateLaundryBranchDto) {
    return this.branchService.create(dto);
  }

  @Get()
  async findAll() {
    return await this.branchService.findAll();
  }

  @Put(':id')
  async update(@Body() dto: UpdateLaundryBranchDto, @Param('id') id: number) {
    return await this.branchService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.branchService.delete(id);
  }
}
