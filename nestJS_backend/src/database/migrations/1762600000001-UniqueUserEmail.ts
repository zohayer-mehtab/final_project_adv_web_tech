import { MigrationInterface, QueryRunner } from 'typeorm';

export class UniqueUserEmail1762600000001 implements MigrationInterface {
  name = 'UniqueUserEmail1762600000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS "UQ_user_email_lower" ON "user" (lower("email"))');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "UQ_user_email_lower"');
  }
}
