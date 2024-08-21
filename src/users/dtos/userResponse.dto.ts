import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Gender, Role } from '../../common/enums';
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Exclude()
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsEnum(Gender)
  gender: Gender;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
