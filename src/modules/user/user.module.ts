import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceUser } from 'src/entities/device-user.entity';
import { LoginHistory } from 'src/entities/login-history.entity';
import { Otp } from 'src/entities/otp.entity';
import { Role } from 'src/entities/role.entity';
import { UserBranchMapping } from 'src/entities/user-branch-mapping.entity';
import { UserCompanyMapping } from 'src/entities/user-company-mapping.entity';
import { User } from 'src/entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      DeviceUser,
      LoginHistory,
      Otp,
      UserCompanyMapping,
      UserBranchMapping,
    ]),
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UsersModule {}
