import { ProductsService } from './products.service';

describe('ProductsService', () => {
  it('requests only public vendor fields when listing products', async () => {
    const repo = { find: jest.fn().mockResolvedValue([]) };
    const service = new ProductsService(repo as any);
    await service.findAllPublic();
    const options = repo.find.mock.calls[0][0];
    expect(options.select.vendor).toEqual({ id: true, username: true, companyName: true });
    expect(options.select.vendor.password).toBeUndefined();
  });

  it('takes vendor identity from the authenticated request', async () => {
    const repo = { create: jest.fn((value) => value), save: jest.fn(async (value) => value) };
    const service = new ProductsService(repo as any);
    const dto = { name: 'Item', description: 'Description', price: 10, stock: 4 };
    await service.create(dto, 9);
    expect(repo.create).toHaveBeenCalledWith({ ...dto, vendor: { id: 9 } });
  });
});
