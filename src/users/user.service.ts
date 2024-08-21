import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken, Users } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dtos';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

const SALT_ROUNDS = 10;
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return plainToInstance(UserResponseDto, users);
  }

  async getUserById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found');

    return plainToInstance(UserResponseDto, user);
  }

  async getUserbyEmail(email: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOneBy({ email });

    if (!user)
      throw new NotFoundException('User with this email does not exist');

    return plainToInstance(UserResponseDto, user);
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      SALT_ROUNDS,
    );

    try {
      const newUser = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      await this.userRepository.save(newUser);
      return plainToInstance(UserResponseDto, newUser);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Email already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const hashedPassword = await bcrypt.hash(
      updateUserDto.password,
      SALT_ROUNDS,
    );

    try {
      await this.userRepository.update(id, {
        ...updateUserDto,
        password: hashedPassword,
      });

      const updatedUser = await this.userRepository.findOne({ where: { id } });

      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return plainToInstance(UserResponseDto, updatedUser);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Email already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async deleteUser(id: number) {
    await this.userRepository.delete(id);
    await this.refreshTokenRepository.delete({ userId: id });

    return {
      message: `User with id: ${id} has been deleted`,
    };
  }
}
