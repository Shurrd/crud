import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken, ResetToken, Transactions, Users } from 'src/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { MailService } from 'src/services';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy, JwtStrategy } from './strategies';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, RefreshToken, ResetToken, Transactions]),
    PassportModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, JwtStrategy, GoogleStrategy],
})
export class AuthModule {}
