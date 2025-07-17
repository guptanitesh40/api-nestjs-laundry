import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'about-us' })
export class AboutUs extends BaseEntity {
  @PrimaryGeneratedColumn()
  about_us_id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  image: string;

  @Column()
  description1: string;

  @Column()
  youtube_link: string;
}
