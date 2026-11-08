import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  it('rejects incorrect login credentials without issuing a token', async () => {
    const auth = { validateUser: jest.fn().mockResolvedValue(null), login: jest.fn() };
    const controller = new AuthController(auth as any, {} as any);
    await expect(controller.login({ email: 'buyer@example.test', password: 'wrong' })).rejects.toBeInstanceOf(UnauthorizedException);
    expect(auth.login).not.toHaveBeenCalled();
  });
});
