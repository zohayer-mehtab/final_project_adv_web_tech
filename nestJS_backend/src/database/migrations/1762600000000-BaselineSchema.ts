import { MigrationInterface, QueryRunner } from 'typeorm';

export class BaselineSchema1762600000000 implements MigrationInterface {
  name = 'BaselineSchema1762600000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum' AND typnamespace = current_schema()::regnamespace)
      THEN CREATE TYPE "user_role_enum" AS ENUM ('buyer', 'vendor', 'admin'); END IF;
    END $$`);
    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'orders_status_enum' AND typnamespace = current_schema()::regnamespace)
      THEN CREATE TYPE "orders_status_enum" AS ENUM ('Pending', 'Shipped', 'Delivered', 'Cancelled'); END IF;
    END $$`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "user" (
      "id" SERIAL PRIMARY KEY,
      "username" character varying NOT NULL UNIQUE,
      "email" character varying NOT NULL,
      "password" character varying NOT NULL,
      "role" "user_role_enum" NOT NULL DEFAULT 'buyer',
      "isApproved" boolean NOT NULL DEFAULT false,
      "companyName" character varying,
      "resetToken" character varying,
      "resetTokenExpires" timestamp without time zone
    )`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "products" (
      "id" SERIAL PRIMARY KEY,
      "name" character varying NOT NULL,
      "description" text NOT NULL,
      "price" numeric(10,2) NOT NULL,
      "stock" integer NOT NULL,
      "isApproved" boolean NOT NULL DEFAULT false,
      "vendorId" integer REFERENCES "user"("id") ON DELETE CASCADE
    )`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "orders" (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "quantity" integer NOT NULL,
      "status" "orders_status_enum" NOT NULL DEFAULT 'Pending',
      "orderedAt" timestamp without time zone NOT NULL DEFAULT now(),
      "buyerId" integer REFERENCES "user"("id"),
      "productId" integer REFERENCES "products"("id")
    )`);
  }

  async down(): Promise<void> {
    throw new Error('Baseline rollback is intentionally disabled to protect existing marketplace data');
  }
}
