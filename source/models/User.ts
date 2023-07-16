import { Entity, Column, OneToMany, BaseEntity, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { UserAddress } from './UserAddress';
import { UserPhoneNumber } from './UserPhoneNumber';
import { MonthlyReading } from './MonthlyReading';

@Entity()
export class User extends BaseEntity {

  @CreateDateColumn()
  creation_date: Date;

  @UpdateDateColumn()
  date_last_updated: Date;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @Unique(['email'])
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  first_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  middle_name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  last_name: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  extension: string;

  @Column({ type: 'varchar', length: 35, nullable: true })
  relationship_status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profile_picture: string;

  @Column({ type: 'boolean', nullable: true })
  night_mode: boolean;

  @Column({ type: 'varchar', length: 25, nullable: true })
  user_type: string;

  @OneToMany(() => UserAddress, (address) => address.user, { cascade: true })
  addresses: UserAddress[];

  @OneToMany(() => UserPhoneNumber, (phoneNumber) => phoneNumber.user, { cascade: true })
  phoneNumbers: UserPhoneNumber[];

  @OneToMany(() => MonthlyReading, (reading) => reading.meter_reader)
  monthlyReadings: MonthlyReading[];
}
