import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'about-us' })
export class AboutUs extends BaseEntity {
  @PrimaryGeneratedColumn()
  about_us_id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description1: string;

  @Column({ type: 'text' })
  description2: string;

  @Column()
  image: string;

  @Column({ type: 'text' })
  description3: string;

  @Column({ type: 'text' })
  description4: string;

  @Column()
  youtube_link: string;
}
