import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './users/user.service';
import { UserController } from './users/user.controller';
import { UserModule } from './users/user.module';
import { RefreshToken, ResetToken, Users } from './entities';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { IsUniqueConstraint } from './common/validators';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from './services';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([Users, RefreshToken, ResetToken]),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
      entities: [Users, RefreshToken, ResetToken],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController, UserController, AuthController],
  providers: [
    AppService,
    UserService,
    AuthService,
    MailService,
    IsUniqueConstraint,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
