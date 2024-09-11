import { OtpType } from 'src/enum/otp.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'otps' })
export class Otp extends BaseEntity {
  @PrimaryGeneratedColumn()
  otp_id: number;

  @Column({ type: 'decimal', nullable: true })
  mobile_number: number;

  @Column()
  otp: number;

  @Column({
    type: 'enum',
    enum: OtpType,
  })
  type: OtpType;
}
