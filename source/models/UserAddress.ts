import { Entity, Column, ManyToOne, BaseEntity } from 'typeorm';
import { User } from './User';

@Entity()
export class UserAddress extends BaseEntity {

  @ManyToOne(() => User, (user) => user.addresses)
  user: User;

  @Column({ type: 'varchar', length: 100, nullable: false })
  city: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  barangay: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  postal_code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  details: string;
}
