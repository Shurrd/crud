import { Gender, Role } from 'src/common/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Transactions } from './transaction.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'first_name',
    nullable: false,
  })
  firstName: string;

  @Column({
    name: 'last_name',
    nullable: false,
  })
  lastName: string;

  @Column({
    name: 'email',
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    name: 'password',
    nullable: false,
  })
  password: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: Role,
    default: Role.USER,
    nullable: false,
  })
  role: Role;

  @Column({
    name: 'gender',
    type: 'enum',
    enum: Gender,
    nullable: false,
  })
  gender: string;

  @OneToMany(() => Transactions, (transaction) => transaction.user)
  transactions: Transactions[];

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
