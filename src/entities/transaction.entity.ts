import { nanoid } from 'nanoid';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from './user.entity';
import { TransactionType } from '../common/enums';

@Entity()
export class Transactions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'transaction_id' })
  transactionId: string;

  @BeforeInsert()
  generateId() {
    this.transactionId = nanoid(32);
  }

  @Column('decimal', {
    precision: 12,
    scale: 2,
  })
  amount: number;

  @Column({
    name: 'transaction_type',
  })
  transactionType: TransactionType;

  @ManyToOne(() => Users, (user) => user.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @CreateDateColumn({
    name: 'transaction_date',
  })
  transactionDate: Date;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
