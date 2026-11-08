import { UsersService } from './users.service';
import { Role } from '../role.enum';

describe('UsersService', () => {
  const entity = {
    id: 1,
    username: 'buyer',
    email: 'buyer@example.test',
    password: 'hash',
    role: Role.BUYER,
    isApproved: true,
    resetToken: 'private',
  };

  it('returns safe projections and applies only allowed profile changes', async () => {
    const repo = {
      findOne: jest.fn().mockResolvedValue(entity),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const service = new UsersService(repo as any);
    expect(await service.findOne(1)).toEqual({
      id: 1,
      username: 'buyer',
      email: 'buyer@example.test',
      role: Role.BUYER,
      isApproved: true,
      companyName: undefined,
    });
    await service.update(1, { username: 'updated', role: Role.ADMIN } as any);
    expect(repo.update).toHaveBeenCalledWith(1, { username: 'updated' });
  });

  it('turns a database uniqueness violation into a safe conflict response', async () => {
    const repo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value) => value),
      save: jest.fn().mockRejectedValue({ driverError: { code: '23505' } }),
    };
    const service = new UsersService(repo as any);
    await expect(
      service.register({
        username: 'buyer',
        email: 'Buyer@Example.test',
        password: 'strong-pass-123',
        role: Role.BUYER,
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
});
