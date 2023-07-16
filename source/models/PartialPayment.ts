import { Entity, Column, ManyToOne, BaseEntity, CreateDateColumn } from 'typeorm';
import { ClientBill } from './ClientBill';

@Entity("Partial_Payment")
export class PartialPayment extends BaseEntity {

  @ManyToOne(() => ClientBill, (clientBill) => clientBill.partialPayments, { cascade: true })
  client_bill: ClientBill;

  @CreateDateColumn()
  payment_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;
}
