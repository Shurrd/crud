import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactions, Users } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateTransactionDto, TransactionResponseDto } from './dtos';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,

    @InjectRepository(Transactions)
    private readonly transactionRepository: Repository<Transactions>,
  ) {}

  async getAllTransactions() {
    const transactions = await this.transactionRepository.find({
      relations: ['user'],
    });

    const plainTransactions = transactions.map((transaction) => {
      const plainUserResponse = {
        id: transaction.user.id,
        email: transaction.user.email,
        firstName: transaction.user.firstName,
        lastName: transaction.user.lastName,
      };

      return {
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        transactionType: transaction.transactionType,
        transactionDate: transaction.transactionDate,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        user: plainUserResponse,
      };
    });

    return plainTransactions;
  }

  async getTransactionsByUser(userId: number) {
    const transactions = await this.transactionRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (transactions.length === 0)
      throw new NotFoundException('No transactions found');

    return transactions.map((transaction) => ({
      transactionId: transaction.transactionId,
      amount: transaction.amount,
      transactionType: transaction.transactionType,
      transactionDate: transaction.transactionDate,
      user: {
        id: transaction.user.id,
        email: transaction.user.email,
        firstName: transaction.user.firstName,
        lastName: transaction.user.lastName,
      },
    }));
  }

  async getTransactionById(transactionId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId },
      relations: ['user'],
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

    const plainUserResponse = {
      id: transaction.user.id,
      email: transaction.user.email,
      firstName: transaction.user.firstName,
      lastName: transaction.user.lastName,
    };

    return {
      transactionId: transaction.transactionId,
      amount: transaction.amount,
      transactionType: transaction.transactionType,
      transactionDate: transaction.transactionDate,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      user: plainUserResponse,
    };
  }

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
    id: number,
  ): Promise<TransactionResponseDto> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found');

    const plainUserResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const newTransaction = this.transactionRepository.create({
      ...createTransactionDto,
      user: plainUserResponse,
    });

    await this.transactionRepository.save(newTransaction);

    return plainToInstance(TransactionResponseDto, newTransaction);
  }
}
