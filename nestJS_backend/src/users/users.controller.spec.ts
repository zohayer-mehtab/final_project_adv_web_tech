import { UsersController } from './users.controller';
import { Role } from '../role.enum';

describe('UsersController', () => {
  it('passes administrative account creation and approvals to the user service', async () => {
    const users = { create: jest.fn().mockResolvedValue({ id: 1 }), approveUser: jest.fn().mockResolvedValue({ id: 2 }) };
    const controller = new UsersController(users as any);
    const dto = { username: 'admin', email: 'admin@example.test', password: 'strong-pass-123', role: Role.ADMIN };
    await expect(controller.create(dto)).resolves.toEqual({ id: 1 });
    await expect(controller.approveVendor(2)).resolves.toEqual({ id: 2 });
    expect(users.create).toHaveBeenCalledWith(dto);
    expect(users.approveUser).toHaveBeenCalledWith(2);
  });
});
