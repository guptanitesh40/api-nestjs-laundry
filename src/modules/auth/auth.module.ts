import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { DeviceUser } from 'src/entities/device-user.entity';
import { LoginHistory } from 'src/entities/login-history.entity';
import { Otp } from 'src/entities/otp.entity';
import { UserBranchMapping } from 'src/entities/user-branch-mapping.entity';
import { UserCompanyMapping } from 'src/entities/user-company-mapping.entity';
import { User } from 'src/entities/user.entity';
import { WorkshopManagerMapping } from 'src/entities/workshop-manager-mapping.entity';
import { UserService } from 'src/modules/user/user.service';
import { OrderModule } from '../order/order.module';
import { UsersModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt-strategy';

config();

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    TypeOrmModule.forFeature([
      User,
      DeviceUser,
      LoginHistory,
      Otp,
      UserCompanyMapping,
      UserBranchMapping,
      WorkshopManagerMapping,
    ]),
    UsersModule,
    OrderModule,
    HttpModule,
  ],
  providers: [AuthService, UserService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
