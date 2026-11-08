import { ProductsController } from './products.controller';

describe('ProductsController', () => {
  it('binds product creation to the authenticated vendor', async () => {
    const products = { create: jest.fn().mockResolvedValue({ id: 2 }) };
    const controller = new ProductsController(products as any);
    const dto = { name: 'Item', description: 'Description', price: 10, stock: 4 };
    await expect(controller.create(dto, { user: { userId: 7 } })).resolves.toEqual({ id: 2 });
    expect(products.create).toHaveBeenCalledWith(dto, 7);
  });
});
