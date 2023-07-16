import { Entity, Column, ManyToOne, BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Client } from './Client';

@Entity()
export class ClientConnectionStatus extends BaseEntity {

  @ManyToOne(() => Client, (client) => client.connectionStatuses)
  client: Client;

  @CreateDateColumn()
  creation_date: Date;

  @UpdateDateColumn()
  date_last_updated: Date;

  @Column({ type: 'varchar', length: 30, nullable: false })
  connection_status: string;
}
