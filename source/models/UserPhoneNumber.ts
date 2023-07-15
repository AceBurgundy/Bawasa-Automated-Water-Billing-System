import { Entity, Column, ManyToOne, BaseEntity } from 'typeorm';
import { User } from './User';

@Entity()
export class UserPhoneNumber extends BaseEntity {

  @ManyToOne(() => User, (user) => user.phoneNumbers)
  user: User;

  @Column({ type: 'varchar', length: 20, nullable: false })
  phone_number: string;
}
