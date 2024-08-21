import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateTransactionDto } from './dtos';
import { RequestWithUser } from 'src/types';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from 'src/common/guards';

@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

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
