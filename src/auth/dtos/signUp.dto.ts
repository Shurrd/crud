import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Gender, Role } from '../../common/enums';

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

export class SignupDto {
  @IsString()
  @MinLength(2, {
    message: 'First Name must have atleast 2 characters',
  })
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @MinLength(2, {
    message: 'Last Name must have atleast 2 characters',
  })
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Matches(passwordRegex, {
    message:
      'Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character',
  })
  @IsNotEmpty()
  password: string;

  @IsEnum(Gender, {
    message: 'Valid Gender required',
  })
  gender: Gender;
}
