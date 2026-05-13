import {
  IsEmail,
  MinLength,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Role } from 'src/role.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  companyName?: string;
}
