import { IsNotEmpty, IsString, Matches } from 'class-validator';

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  resetToken: string;

  @IsNotEmpty()
  @IsString()
  @Matches(passwordRegex, {
    message:
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword: string;
}
