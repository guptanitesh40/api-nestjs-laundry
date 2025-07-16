import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WelcomeService } from './welcome.service';
import { WelcomeController } from './welcome.controller';
import { Welcome } from 'src/entities/welcome.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Welcome])],
  providers: [WelcomeService],
  controllers: [WelcomeController],
})
export class WelcomeModule {}
