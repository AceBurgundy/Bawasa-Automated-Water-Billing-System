import { Entity, Column, ManyToOne, BaseEntity } from 'typeorm';
import { Client } from './Client';

@Entity()
export class ClientConnectionStatus extends BaseEntity {

  @ManyToOne(() => Client, (client) => client.connectionStatuses)
  client: Client;

  @Column({ type: 'date', default: () => 'CURRENT_DATE', nullable: false })
  creation_date: Date;

  @Column({ type: 'varchar', length: 30, nullable: false })
  connection_status: string;
}
