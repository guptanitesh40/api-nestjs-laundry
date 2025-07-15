import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaundryBranchService } from './laundry-branch.service';
import { LaundryBranchController } from './laundry-branch.controller';
import { LaundryBranch } from 'src/entities/laundry-branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LaundryBranch])],
  controllers: [LaundryBranchController],
  providers: [LaundryBranchService],
  exports: [LaundryBranchService],
})
export class LaundryBranchModule {}
