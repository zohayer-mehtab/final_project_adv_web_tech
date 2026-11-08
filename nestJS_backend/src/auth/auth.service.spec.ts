import { BadRequestException, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '../role.enum';

describe('password reset lifecycle', () => {
  const account = { id: 1, email: 'buyer@example.test', role: Role.BUYER, password: 'stored-hash', isApproved: true };
  let storedHash: string | null;
  let expires: Date | null;
  let deliveredCode: string;
  let deliveryFails: boolean;
  let service: AuthService;

  beforeEach(() => {
    storedHash = null;
    expires = null;
    deliveredCode = '';
    deliveryFails = false;
    const users = {
      findByEmail: jest.fn(async (email: string) => email === account.email ? account : null),
      setResetToken: jest.fn(async (_id: number, hash: string, deadline: Date) => { storedHash = hash; expires = deadline; }),
      clearResetToken: jest.fn(async (_id: number, hash: string) => { if (storedHash === hash) storedHash = null; }),
      consumeResetToken: jest.fn(async (hash: string) => {
        if (storedHash !== hash || !expires || expires <= new Date()) return false;
        storedHash = null;
        expires = null;
        return true;
      }),
    };
    const mail = { sendPasswordResetEmail: jest.fn(async (_email: string, code: string) => {
      deliveredCode = code;
      if (deliveryFails) throw new Error('mailer unavailable');
    }) };
    service = new AuthService(users as any, { sign: jest.fn() } as any, mail as any, { getOrThrow: () => 'test-only-secret' } as any);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('stores a hash and consumes a valid code once', async () => {
    await expect(service.forgotPassword(account.email)).resolves.toEqual({ message: 'If an account exists, reset instructions will be sent.' });
    expect(deliveredCode).toMatch(/^\d{6}$/);
    expect(storedHash).toMatch(/^[a-f0-9]{64}$/);
    expect(storedHash).not.toBe(deliveredCode);
    await expect(service.resetPassword(deliveredCode, 'strong-pass-123')).resolves.toEqual({ message: 'Password has been reset successfully' });
    await expect(service.resetPassword(deliveredCode, 'strong-pass-123')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid and expired codes', async () => {
    await service.forgotPassword(account.email);
    await expect(service.resetPassword('000000', 'strong-pass-123')).rejects.toBeInstanceOf(BadRequestException);
    expires = new Date(Date.now() - 1);
    await expect(service.resetPassword(deliveredCode, 'strong-pass-123')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns the same public response for unknown accounts and mail failures', async () => {
    const unknown = await service.forgotPassword('absent@example.test');
    deliveryFails = true;
    const failed = await service.forgotPassword(account.email);
    expect(failed).toEqual(unknown);
    expect(storedHash).toBeNull();
    expect(Logger.prototype.error).toHaveBeenCalledWith('Password reset email delivery failed');
  });
});
