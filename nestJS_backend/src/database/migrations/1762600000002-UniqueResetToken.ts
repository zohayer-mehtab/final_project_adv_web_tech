import { MigrationInterface, QueryRunner } from 'typeorm';

export class UniqueResetToken1762600000002 implements MigrationInterface {
  name = 'UniqueResetToken1762600000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS "UQ_user_reset_token" ON "user" ("resetToken") WHERE "resetToken" IS NOT NULL');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "UQ_user_reset_token"');
  }
}
