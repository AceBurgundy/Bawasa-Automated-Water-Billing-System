import { Entity, Column, ManyToOne, OneToMany, BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Client } from './Client';
import { PartialPayment } from './PartialPayment';

@Entity()
export class ClientBill extends BaseEntity {

  @CreateDateColumn()
  creation_date: Date;

  @UpdateDateColumn()
  date_last_updated: Date;

  @ManyToOne(() => Client, (client) => client.bills)
  client: Client;

  @OneToMany(() => PartialPayment, (partialPayment) => partialPayment.client_bill, { cascade: true })
  partialPayments: PartialPayment[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  previous_reading: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  current_reading: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  consumption: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  bill_amount: number;

  @Column({ type: 'varchar', length: 50, nullable: false, default: 'pending' })
  payment_status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  payment_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  remaining_balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  payment_excess: number;

  @Column({ type: 'date', nullable: true })
  payment_date: Date;

  @Column({ type: 'date', nullable: true })
  disconnection_date: Date;
}
