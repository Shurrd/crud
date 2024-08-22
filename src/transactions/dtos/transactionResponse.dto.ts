import { Exclude, Expose } from 'class-transformer';
import { TransactionType } from 'src/common/enums';
import { UserResponseDto } from 'src/users/dtos';

export class TransactionResponseDto {
  @Exclude()
  id: number;

  @Expose()
  transactionId: string;

  @Expose()
  amount: number;

  @Expose()
  transactionType: TransactionType;

  @Expose()
  transactionDate: Date;

  @Expose()
  user: UserResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
