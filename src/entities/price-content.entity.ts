import { IsArray, IsNumber, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('price-content')
export class PriceContent extends BaseEntity {
  @PrimaryGeneratedColumn()
  price_content_id: number;

  @Column()
  @IsString()
  category_name: string;

  @Column('simple-array')
  @IsArray()
  service_names: string[];

  @Column({ nullable: false })
  @IsNumber()
  price: number;
}
