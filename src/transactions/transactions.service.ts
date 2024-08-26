import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactions, Users } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateTransactionDto, TransactionResponseDto } from './dtos';
import { plainToInstance } from 'class-transformer';
import { createObjectCsvWriter } from 'csv-writer';
import { Response } from 'express';
import { join } from 'path';
import { promises as fs } from 'fs';
import * as PDFDocument from 'pdfkit';

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

  async exportAllTransactions(res: Response) {
    const transactions = await this.transactionRepository.find({
      relations: ['user'],
    });

    const exportsDir = join(__dirname, '..', '..', 'exports');

    await fs.mkdir(exportsDir, { recursive: true });

    const fileName = `transactions-${Date.now()}.csv`;
    const filePath = join(exportsDir, fileName);

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'transactionId', title: 'Transaction ID' },
        { id: 'amount', title: 'Amount' },
        { id: 'transactionType', title: 'Transaction Type' },
        { id: 'transactionDate', title: 'Transaction Date' },
        { id: 'userId', title: 'User ID' },
        { id: 'userEmail', title: 'User Email' },
        { id: 'userFirstName', title: 'User First Name' },
        { id: 'userLastName', title: 'User Last Name' },
      ],
    });

    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      transactionId: transaction.transactionId,
      amount: transaction.amount,
      transactionType: transaction.transactionType,
      transactionDate: transaction.transactionDate,
      userId: transaction.user.id,
      userEmail: transaction.user.email,
      userFirstName: transaction.user.firstName,
      userLastName: transaction.user.lastName,
    }));

    await csvWriter.writeRecords(formattedTransactions);

    res.download(filePath, fileName);
  }

  async exportTransactionsByUser(userId: number, res: Response) {
    const transactions = await this.transactionRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    const exportsDir = join(__dirname, '..', '..', 'exports');

    await fs.mkdir(exportsDir, { recursive: true });

    const fileName = `transactions-user-${userId}-${Date.now()}.csv`;
    const filePath = join(exportsDir, fileName);

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'transactionId', title: 'Transaction ID' },
        { id: 'amount', title: 'Amount' },
        { id: 'transactionType', title: 'Transaction Type' },
        { id: 'transactionDate', title: 'Transaction Date' },
        { id: 'userId', title: 'User ID' },
        { id: 'userEmail', title: 'User Email' },
        { id: 'userFirstName', title: 'User First Name' },
        { id: 'userLastName', title: 'User Last Name' },
      ],
    });

    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      transactionId: transaction.transactionId,
      amount: transaction.amount,
      transactionType: transaction.transactionType,
      transactionDate: transaction.transactionDate,
      userId: transaction.user.id,
      userEmail: transaction.user.email,
      userFirstName: transaction.user.firstName,
      userLastName: transaction.user.lastName,
    }));

    await csvWriter.writeRecords(formattedTransactions);

    res.download(filePath, fileName);
  }

  async exportTransactionSummaryasPdf(transactionId: string): Promise<Buffer> {
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId },
      relations: ['user'],
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'LETTER',
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));

      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text('Transaction Summary', { align: 'center' });

      doc.moveDown();

      doc.fontSize(14).text(`Transaction ID: ${transaction.transactionId}`);
      doc.text(`Amount: $${transaction.amount}`);
      doc.text(`Transaction Type: ${transaction.transactionType}`);
      doc.text(
        `Transaction Date: ${transaction.transactionDate.toDateString()}`,
      );

      doc.moveDown();

      doc.text('User Details:', { underline: true });
      doc.text(`User ID: ${transaction.user.id}`);
      doc.text(`User Email: ${transaction.user.email}`);
      doc.text(
        `User Name: ${transaction.user.firstName} ${transaction.user.lastName}`,
      );

      doc.end();
    });

    return pdfBuffer;
  }
}
