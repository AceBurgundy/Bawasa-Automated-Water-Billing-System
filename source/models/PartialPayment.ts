import { Entity, Column, ManyToOne, BaseEntity } from 'typeorm';
import { ClientBill } from './ClientBill';

@Entity("Partial_Payment")
export class PartialPayment extends BaseEntity {

  @ManyToOne(() => ClientBill, (clientBill) => clientBill.partialPayments, { cascade: true })
  client_bill: ClientBill;

  @Column({ type: 'date', default: () => 'CURRENT_DATE', nullable: false })
  payment_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;
}
