import { Entity, Column, OneToMany, BaseEntity, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { ClientConnectionStatus } from './ClientConnectionStatus';
import { ClientAddress } from './ClientAddress';
import { ClientPhoneNumber } from './ClientPhoneNumber';
import { MonthlyReading } from './MonthlyReading';
import { ClientBill } from './ClientBill';

@Entity()
export class Client  extends BaseEntity {

  @CreateDateColumn()
  creation_date: Date;

  @UpdateDateColumn()
  date_last_updated: Date;

  @Column({ type: 'varchar', length: 255, nullable: false })
  first_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  middle_name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  last_name: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  extension: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @Unique(['email'])
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false, default: 'profile_picture.webp' })
  profile_picture: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  house_picture: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  occupation: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  relationship_status: string;

  @Column({ type: 'varchar', length: 25, nullable: false })
  meter_number: string;

  @OneToMany(() => ClientConnectionStatus, (connectionStatus) => connectionStatus.client, { cascade: true })
  connectionStatuses: ClientConnectionStatus[];

  @OneToMany(() => ClientAddress, (address) => address.client, { cascade: true })
  addresses: ClientAddress[];

  @OneToMany(() => ClientPhoneNumber, (phoneNumber) => phoneNumber.client, { cascade: true })
  phoneNumbers: ClientPhoneNumber[];

  @OneToMany(() => MonthlyReading, (reading) => reading.client, { cascade: true })
  monthlyReadings: MonthlyReading[];

  @OneToMany(() => ClientBill, (bill) => bill.client, { cascade: true })
  bills: ClientBill[];
}
