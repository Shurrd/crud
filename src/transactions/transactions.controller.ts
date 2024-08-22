import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateTransactionDto } from './dtos';
import { RequestWithUser } from 'src/types';
import { TransactionsService } from './transactions.service';
import { AuthGuard, RoleGuard } from 'src/common/guards';
import { Roles } from 'src/common/decorators';
import { Role } from 'src/common/enums';
import { Response } from 'express';

@UseGuards(AuthGuard)
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
  async getTransactionsByLoggedInUser(@Req() req: RequestWithUser) {
    return await this.transactionsService.getTransactionsByUser(req.user.id);
  }

  @Get('export')
  async exportAllTransactions(@Res() res: Response) {
    await this.transactionsService.exportAllTransactions(res);
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
