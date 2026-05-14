# Commit No. 1

## Completed Tasks

- **Project Initialization:** Successfully generated the NestJS application and set up the foundational directory structure.
- **Environment Configuration:** Implemented `@nestjs/config` to securely manage environment variables (e.g., `DATABASE_URL`, `JWT_SECRET`) via the `.env` file.
- **Database Integration:** Wired up PostgreSQL using TypeORM (`TypeOrmModule.forRootAsync`), establishing a successful connection to the `b2b_marketplace` database.
- **Data Validation:** Enabled global validation using `ValidationPipe`, `class-validator`, and `class-transformer` to strictly enforce DTO rules.
- **User Module & Entity:**
  - Created the `User` entity defining the database schema.
  - Implemented the `Role` enum (Buyer, Vendor, Admin).
  - Configured business logic to ensure new Vendors default to `isApproved: false`.
- **Security & Password Hashing:** Integrated `bcryptjs` to securely hash user passwords before saving them to the database.
- **Authentication Layer:**
  - Created the `AuthModule`, `AuthService`, and `AuthController`.
  - Implemented the `/auth/register` endpoint utilizing the `UsersService`.
  - Implemented the `/auth/login` endpoint with password validation.
  - Successfully integrated `@nestjs/jwt` to generate and return JSON Web Tokens upon successful login.
- **Bug Fix:** Import `UnauthorizedException` in `auth.controller.ts` to prevent a runtime crash on failed logins.

### Commit 2
* **Strict Login Validation:** Replaced the `Record<string, any>` anti-pattern with `LoginDto` to strictly enforce email and password validation using `class-validator`.
* **JWT Strategy Implementation:** Created `jwt.strategy.ts` to securely extract, decode, and validate the Bearer token from incoming HTTP headers.
* **Auth Guard Setup:** Built the `JwtAuthGuard` to act as a middleware for protected routes.
* **Protected Profile Endpoint:** Successfully implemented Requirement #2 (`/auth/me`) by applying the `JwtAuthGuard`, which now returns the decoded user profile payload directly from the validated token.
* **I'm making this commit at midnight(12:01 a.m., 15th of May)**