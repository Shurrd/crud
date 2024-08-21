import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactions, Users } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dtos';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,

    @InjectRepository(Transactions)
    private readonly transactionRepository: Repository<Transactions>,
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
    id: number,
  ) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found');

    const newTransaction = this.transactionRepository.create({
      ...createTransactionDto,
      user,
    });

    await this.transactionRepository.save(newTransaction);

    return newTransaction;
  }
}
