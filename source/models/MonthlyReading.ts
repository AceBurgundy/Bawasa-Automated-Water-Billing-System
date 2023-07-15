import { Entity, Column, ManyToOne, BaseEntity } from 'typeorm';
import { Client } from './Client';
import { User } from './User';

@Entity()
export class MonthlyReading extends BaseEntity {

  @ManyToOne(() => Client, (client) => client.monthlyReadings)
  client: Client;

  @ManyToOne(() => User, (user) => user.monthlyReadings)
  meter_reader: User;

  @Column({ type: 'date', default: () => 'CURRENT_DATE', nullable: false })
  creation_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  reading: number;
}
