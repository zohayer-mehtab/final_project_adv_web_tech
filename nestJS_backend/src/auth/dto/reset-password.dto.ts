import { IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @Matches(/^\d{6}$/)
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
