import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken, ResetToken, Transactions, Users } from 'src/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { UserService } from 'src/users/user.service';
import { MailService } from 'src/services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, RefreshToken, ResetToken, Transactions]),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService],
})
export class AuthModule {}
