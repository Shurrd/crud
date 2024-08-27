import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateTransactionDto } from './dtos';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard, RoleGuard } from 'src/common/guards';
import { CurrentUser, Roles } from 'src/common/decorators';
import { Role } from 'src/common/enums';
import { Response } from 'express';
import { Users } from 'src/entities';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RoleGuard)
  @Get()
  async getAllTransactions() {
    return await this.transactionsService.getAllTransactions();
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RoleGuard)
  @Get('user')
  async getTransactionsByUser(@Query('userId') userId: number) {
    return await this.transactionsService.getTransactionsByUser(userId);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RoleGuard)
  @Get('transaction/:id')
  async getTransactionById(@Param('id') transactionId: string) {
    return await this.transactionsService.getTransactionById(transactionId);
  }

  @Get('account/details')
  async getTransactionsByLoggedInUser(@CurrentUser() user: Users) {
    return await this.transactionsService.getTransactionsByUser(user.id);
  }

  @Get('export')
  async exportAllTransactions(@Res() res: Response) {
    await this.transactionsService.exportAllTransactions(res);
  }

  @Get('export/user/:id')
  async exportTransactionsByUser(
    @Param('id') userId: number,
    @Res() res: Response,
  ) {
    await this.transactionsService.exportTransactionsByUser(userId, res);
  }

  @Get('export/active-user')
  async exportTransactionsByLoggedInUser(
    @CurrentUser() user: Users,
    @Res() res: Response,
  ) {
    await this.transactionsService.exportTransactionsByUser(user.id, res);
  }

  @Get('export/transaction/:transactionId')
  async exportTransactionSummaryasPdf(
    @Param('transactionId') transactionId: string,
    @Res() res: Response,
    @CurrentUser() user: Users,
  ) {
    const transaction =
      await this.transactionsService.getTransactionById(transactionId);

    if (user.id === transaction.user.id || user.role === 'admin') {
      const pdfBuffer =
        await this.transactionsService.exportTransactionSummaryasPdf(
          transactionId,
        );
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="transaction-${transactionId}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      res.end(pdfBuffer);
    } else {
      throw new ForbiddenException(
        'You are not allowed to export this transaction',
      );
    }
  }

  @Post()
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() user: Users,
  ) {
    return await this.transactionsService.createTransaction(
      createTransactionDto,
      user.id,
    );
  }
}
