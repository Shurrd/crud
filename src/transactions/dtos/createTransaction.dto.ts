import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { TransactionType } from 'src/common/enums';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(TransactionType, {
    message: 'Valid Transaction Types are DEPOSIT,WITHDRAWAL,TRANSFER',
  })
  transactionType: TransactionType;
}
