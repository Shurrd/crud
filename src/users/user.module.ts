import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken, ResetToken, Users } from 'src/entities';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { AuthController } from 'src/auth/auth.controller';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, RefreshToken, ResetToken]),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [UserController, AuthController],
  providers: [UserService, AuthService, JwtService, ConfigService, MailService],
})
export class UserModule {}
