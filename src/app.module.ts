import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from './users/user.service';
import { UserController } from './users/user.controller';
import { UserModule } from './users/user.module';
import { RefreshToken, ResetToken, Transactions, Users } from './entities';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { IsUniqueConstraint } from './common/validators';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from './services';
import { TransactionsModule } from './transactions/transactions.module';
import { TransactionsService } from './transactions/transactions.service';
import { TransactionsController } from './transactions/transactions.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([Users, RefreshToken, ResetToken, Transactions]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: true,
        autoLoadEntities: true,
        entities: ['dist/entities/*{.ts,.js}'],
        migrations: ['dist/migrations/*{.ts,.js}'],
        seeds: ['dist/seeds/**/*{.ts,.js}'],
      }),
      inject: [ConfigService],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
    }),
    UserModule,
    AuthModule,
    TransactionsModule,
  ],
  controllers: [
    AppController,
    UserController,
    AuthController,
    TransactionsController,
  ],
  providers: [
    AppService,
    UserService,
    AuthService,
    TransactionsService,
    MailService,
    IsUniqueConstraint,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
