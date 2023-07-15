import { Entity, Column, ManyToOne, BaseEntity } from 'typeorm';
import { Client } from './Client';

@Entity()
export class ClientAddress extends BaseEntity {

  @ManyToOne(() => Client, (client) => client.addresses)
  client: Client;

  @Column({ type: 'varchar', length: 50, nullable: true })
  street_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  subdivision: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  barangay: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  city: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  province: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  postal_code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  details: string;
}
