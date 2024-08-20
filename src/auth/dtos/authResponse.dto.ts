import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Gender, Role } from 'src/common/enums';
import { TokensDto } from './tokens.dto';

export class AuthResponseDto {
  userId: number;

  tokens: TokensDto;

  @IsEmail()
  email: string;

  @IsEnum(Role)
  role: Role;

  @IsEnum(Gender)
  gender: Gender;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
