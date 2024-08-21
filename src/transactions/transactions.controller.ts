import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateTransactionDto } from './dtos';
import { RequestWithUser } from 'src/types';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from 'src/common/guards';

@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getAllTransactions() {
    return await this.transactionsService.getAllTransactions();
  }

  @Get('user')
  async getTransactionsByUser(@Query('userId') userId: number) {
    return await this.transactionsService.getTransactionsByUser(userId);
  }

  @Get(':id')
  async getTransactionById(@Param('id') transactionId: string) {
    return await this.transactionsService.getTransactionById(transactionId);
  }

  @Post()
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() req: RequestWithUser,
  ) {
    return await this.transactionsService.createTransaction(
      createTransactionDto,
      req.user.id,
    );
  }
}
