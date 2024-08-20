import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { RefreshToken, Users } from 'src/entities';
import { AuthResponseDto, SignupDto } from './dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './dtos/';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,

    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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

  logout() {}

  async refreshTokens(refreshToken: string) {
    const token = await this.refreshTokenRepository.findOneBy({
      token: refreshToken,
      expirationDate: MoreThanOrEqual(new Date()),
    });

    if (!token) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.generateUserTokens(token.userId);

    return {
      tokens,
      userId: token.userId,
    };
  }

  async generateUserTokens(id: number) {
    const accessToken = this.jwtService.sign(
      { id },
      { expiresIn: this.configService.get('JWT_EXPIRES_IN') },
    );

    const refreshToken = uuidv4();

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
}
