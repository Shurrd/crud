import { faker } from '@faker-js/faker';
import { Transactions } from '../entities/transaction.entity';
import { Users } from '../entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userFactory = factoryManager.get(Users);
    const TransactionFactory = factoryManager.get(Transactions);

    console.log('seeding users...');
    const users = await userFactory.saveMany(50);

    console.log('seeding transactions...');
    const transactions = await Promise.all(
      users.flatMap((user) =>
        Array(faker.number.int({ min: 1, max: 50 }))
          .fill(null)
          .map(async () => {
            const transaction = await TransactionFactory.make();
            transaction.user = user;
            return transaction;
          }),
      ),
    );

    await dataSource.getRepository(Transactions).save(transactions);
  }
}
