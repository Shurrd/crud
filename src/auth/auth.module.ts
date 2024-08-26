import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken, ResetToken, Transactions, Users } from 'src/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { UserService } from 'src/users/user.service';
import { MailService } from 'src/services';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, RefreshToken, ResetToken, Transactions]),
    PassportModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, JwtStrategy],
})
export class AuthModule {}
