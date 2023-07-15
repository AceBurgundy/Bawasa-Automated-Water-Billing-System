import { Entity, Column, ManyToOne, BaseEntity } from 'typeorm';
import { Client } from './Client';

@Entity()
export class ClientPhoneNumber extends BaseEntity {

  @ManyToOne(() => Client, (client) => client.phoneNumbers)
  client: Client;

  @Column({ type: 'varchar', length: 20, nullable: false })
  phone_number: string;
}
