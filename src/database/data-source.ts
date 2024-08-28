import * as dotenv from 'dotenv';
import { SeederOptions } from 'typeorm-extension';
dotenv.config();

import { DataSource, DataSourceOptions } from 'typeorm';

const options: DataSourceOptions & SeederOptions = {
  type: process.env.DB_TYPE as 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  entities: ['dist/entities/**/*{.js,.ts}"'],
  migrations: ['dist/migrations/**/*{.js,.ts}'],
  migrationsTableName: 'migration_table',
  seeds: ['dist/migrations/**/*{.js,.ts}'],
};

const dataSource = new DataSource(options);
export default dataSource;
