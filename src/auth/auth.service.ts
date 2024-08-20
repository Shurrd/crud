import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { RefreshToken, ResetToken, Users } from 'src/entities';
import {
  AuthResponseDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SignupDto,
  TokensDto,
} from './dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './dtos/';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { MailService } from 'src/services';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,

    @InjectRepository(ResetToken)
    private readonly resetTokenRepository: Repository<ResetToken>,

    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async signUp(signupDto: SignupDto): Promise<AuthResponseDto> {
    const hashedPassword = await bcrypt.hash(signupDto.password, SALT_ROUNDS);

    try {
      const user = this.userRepository.create({
        ...signupDto,
        password: hashedPassword,
      });

      await this.userRepository.save(user);

      const tokens = await this.generateUserTokens(user.id);

      const plainAuthResponse = {
        userId: user.id,
        email: user.email,
        role: user.role,
        gender: user.gender,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        tokens: tokens,
      };

      return plainToInstance(AuthResponseDto, plainAuthResponse);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Email already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOneBy({ email: loginDto.email });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateUserTokens(user.id);

    const plainAuthResponse = {
      userId: user.id,
      email: user.email,
      role: user.role,
      gender: user.gender,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      tokens: tokens,
    };

    return plainToInstance(AuthResponseDto, plainAuthResponse);
  }

  async logout(userId: number): Promise<{ message: string }> {
    await this.refreshTokenRepository.delete({ userId });

    return {
      message: 'Logged out successfully',
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const token = await this.refreshTokenRepository.findOneBy({
      token: refreshTokenDto.refreshToken,
      expirationDate: MoreThanOrEqual(new Date()),
    });

    if (!token) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.generateUserTokens(token.userId);

    return {
      ...tokens,
      userId: token.userId,
    };
  }

  async generateUserTokens(id: number): Promise<TokensDto> {
    const accessToken = this.jwtService.sign(
      { id },
      { expiresIn: this.configService.get('JWT_EXPIRES_IN') },
    );

    const refreshToken = nanoid(64);

    await this.storeRefreshToken(refreshToken, id);

    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(token: string, userId: number) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    let existingToken = await this.refreshTokenRepository.findOne({
      where: { userId },
    });

    if (existingToken) {
      existingToken.token = token;
      existingToken.expirationDate = expirationDate;

      await this.refreshTokenRepository.save(existingToken);
    } else {
      const newToken = this.refreshTokenRepository.create({
        token,
        userId,
        expirationDate,
      });

      await this.refreshTokenRepository.save(newToken);
    }
  }

  async changePassword(
    id: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isPasswordValid) throw new BadRequestException('Invalid Credentials');

    const newHashPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      SALT_ROUNDS,
    );

    user.password = newHashPassword;
    await this.userRepository.save(user);

    return {
      message: 'Password changed successfully',
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOneBy({
      email: forgotPasswordDto.email,
    });

    if (user) {
      const resetToken = nanoid(64);

      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 1);

      const newToken = this.resetTokenRepository.create({
        token: resetToken,
        userId: user.id,
        expirationDate,
      });

      this.mailService.sendPasswordResetEmail(
        forgotPasswordDto.email,
        resetToken,
      );

      await this.resetTokenRepository.save(newToken);
    }

    return {
      message: 'Password reset link sent to your email',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const token = await this.resetTokenRepository.findOneBy({
      token: resetPasswordDto.resetToken,
      expirationDate: MoreThanOrEqual(new Date()),
    });

    if (!token) throw new UnauthorizedException('Invalid Link');

    const user = await this.userRepository.findOneBy({ id: token.userId });

    if (!user) throw new NotFoundException('User not found');

    user.password = await bcrypt.hash(
      resetPasswordDto.newPassword,
      SALT_ROUNDS,
    );

    await this.userRepository.save(user);

    await this.resetTokenRepository.delete({
      token: resetPasswordDto.resetToken,
    });
    return {
      message: 'Password has been reset successfully',
    };
  }
}
