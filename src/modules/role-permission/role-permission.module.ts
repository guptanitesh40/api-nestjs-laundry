import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermission } from 'src/entities/role_permission.entity';
import { RolePermissionController } from './role-permission.controller';
import { RolePermissionService } from './role-permission.service';

@Module({
  imports: [TypeOrmModule.forFeature([RolePermission])],
  controllers: [RolePermissionController],
  providers: [RolePermissionService],
  exports: [RolePermissionService],
})
export class RolePermissionModule {}
