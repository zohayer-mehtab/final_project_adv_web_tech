import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHmac, randomInt } from 'crypto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { Role } from '../role.enum';

const RESET_RESPONSE = {
  message: 'If you have an account, check your email for reset instructions.',
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) return null;
    if (user.role === Role.VENDOR && !user.isApproved) return null;
    return { id: user.id, email: user.email, role: user.role };
  }

  login(user: { id: number; email: string; role: Role }) {
    return {
      access_token: this.jwtService.sign({
        email: user.email,
        sub: user.id,
        role: user.role,
      }),
    };
  }

  getUserProfile(id: number) {
    return this.usersService.findOne(id);
  }

  private hashResetCode(code: string): string {
    return createHmac(
      'sha256',
      this.configService.getOrThrow<string>('JWT_SECRET'),
    )
      .update(code)
      .digest('hex');
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return RESET_RESPONSE;

    const expires = new Date(Date.now() + 15 * 60_000);
    let code: string | undefined;
    let hash: string | undefined;
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = randomInt(0, 1_000_000).toString().padStart(6, '0');
      const candidateHash = this.hashResetCode(candidate);
      try {
        await this.usersService.setResetToken(user.id, candidateHash, expires);
        code = candidate;
        hash = candidateHash;
        break;
      } catch (error) {
        if (this.isUniqueViolation(error)) continue;
        this.logger.error('Password reset token storage failed');
        return RESET_RESPONSE;
      }
    }
    if (!code || !hash) {
      this.logger.error('Password reset code allocation failed');
      return RESET_RESPONSE;
    }

    try {
      await this.mailService.sendPasswordResetEmail(user.email, code);
    } catch {
      try {
        await this.usersService.clearResetToken(user.id, hash);
      } catch {
        this.logger.error('Password reset token cleanup failed');
      }
      this.logger.error('Password reset email delivery failed');
    }
    return RESET_RESPONSE;
  }

  async resetPassword(code: string, newPassword: string) {
    const updated = await this.usersService.consumeResetToken(
      this.hashResetCode(code),
      newPassword,
    );
    if (!updated)
      throw new BadRequestException('Invalid or expired reset code');
    return { message: 'Password has been reset successfully' };
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'driverError' in error &&
      (error as { driverError?: { code?: string } }).driverError?.code ===
        '23505'
    );
  }
}
