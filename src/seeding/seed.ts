import * as dotenv from 'dotenv';
import { runSeeders, SeederOptions } from 'typeorm-extension';
dotenv.config();

import { DataSource, DataSourceOptions } from 'typeorm';
import { UserFactory } from './user.factory';
import { MainSeeder } from './main.seeder';
import { Transactions, Users } from '../entities';
import { TransactionFactory } from './transaction.factory';

const options: DataSourceOptions & SeederOptions = {
  type: process.env.DB_TYPE as 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Users, Transactions],
  seeds: [MainSeeder],
  factories: [UserFactory, TransactionFactory],
};

const dataSource = new DataSource(options);
dataSource.initialize().then(async () => {
  await dataSource.synchronize(true);
  await runSeeders(dataSource);
  process.exit();
});
