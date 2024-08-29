import { Faker } from '@faker-js/faker';
import { TransactionType } from '../enums';
import { Transactions } from '../../entities/transaction.entity';
import { setSeederFactory } from 'typeorm-extension';

export const TransactionFactory = setSeederFactory(
  Transactions,
  (faker: Faker) => {
    const transactionType = Object.values(TransactionType);
    const transaction = new Transactions();

    transaction.transactionId = faker.string.alphanumeric(32);
    transaction.amount = parseFloat(
      faker.finance.amount({
        min: 0,
        max: 100000,
        dec: 2,
      }),
    );
    transaction.transactionType = faker.helpers.arrayElement(transactionType);
    transaction.transactionDate = faker.date.past();
    transaction.createdAt = faker.date.between({
      from: transaction.transactionDate,
      to: new Date(),
    });
    transaction.updatedAt = new Date();
    transaction.user = null as any;

    return transaction;
  },
);
