import { Entity, Column, ManyToOne, BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Client } from './Client';
import { User } from './User';

@Entity()
export class MonthlyReading extends BaseEntity {

  @ManyToOne(() => Client, (client) => client.monthlyReadings)
  client: Client;

  @ManyToOne(() => User, (user) => user.monthlyReadings)
  meter_reader: User;

  @CreateDateColumn()
  creation_date: Date;

  @UpdateDateColumn()
  date_last_updated: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  reading: number;
}
