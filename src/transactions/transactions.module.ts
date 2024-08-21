import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken, ResetToken, Transactions, Users } from 'src/entities';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from 'src/users/user.service';
import { MailService } from 'src/services';
import { AuthController } from 'src/auth/auth.controller';
import { UserController } from 'src/users/user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, RefreshToken, ResetToken, Transactions]),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [UserController, AuthController, TransactionsController],
  providers: [
    UserService,
    AuthService,
    JwtService,
    ConfigService,
    MailService,
    TransactionsService,
  ],
})
export class TransactionsModule {}
