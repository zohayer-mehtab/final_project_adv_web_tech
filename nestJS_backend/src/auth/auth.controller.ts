import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Get,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EndpointRateLimitGuard } from './endpoint-rate-limit.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(EndpointRateLimitGuard)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUserProfile(@Request() req) {
    return await this.authService.getUserProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(req.user.userId, updateUserDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EndpointRateLimitGuard)
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EndpointRateLimitGuard)
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
