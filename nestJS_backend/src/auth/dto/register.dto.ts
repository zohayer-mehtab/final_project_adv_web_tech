import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '../../role.enum';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsIn([Role.BUYER, Role.VENDOR])
  role: Role.BUYER | Role.VENDOR;

  @IsOptional()
  @IsString()
  companyName?: string;
}
