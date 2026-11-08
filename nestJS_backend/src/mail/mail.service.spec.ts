import { MailService } from './mail.service';

describe('MailService', () => {
  it('passes the reset code to the mail transport and propagates delivery failures', async () => {
    const mailer = { sendMail: jest.fn().mockResolvedValue(undefined) };
    const service = new MailService(mailer as any);
    await service.sendPasswordResetEmail('buyer@example.test', '123456');
    expect(mailer.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'buyer@example.test',
      context: { token: '123456' },
    }));
    mailer.sendMail.mockRejectedValueOnce(new Error('delivery failed'));
    await expect(service.sendPasswordResetEmail('buyer@example.test', '123456')).rejects.toThrow('delivery failed');
  });
});
