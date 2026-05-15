# Progress

## Commit No. 1

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

## Commit 2

- **Strict Login Validation:** Replaced the `Record<string, any>` anti-pattern with `LoginDto` to strictly enforce email and password validation using `class-validator`.
- **JWT Strategy Implementation:** Created `jwt.strategy.ts` to securely extract, decode, and validate the Bearer token from incoming HTTP headers.
- **Auth Guard Setup:** Built the `JwtAuthGuard` to act as a middleware for protected routes.
- **Protected Profile Endpoint:** Successfully implemented Requirement #2 (`/auth/me`) by applying the `JwtAuthGuard`, which now returns the decoded user profile payload directly from the validated token.
- **I'm making this commit at midnight(12:01 a.m., 15th of May)**

## Commit 3:

- **Custom Decorator (`@Roles`):** Created `roles.decorator.ts` to attach role-based metadata to specific routes (e.g., restricting endpoints to `Role.ADMIN`).
- **The Enforcer (`RolesGuard`):** Implemented `roles.guard.ts` to intercept requests, read the required roles from the decorator, and validate them against the user's JWT payload. Automatically throws a `403 Forbidden` error for unauthorized access.
- **JWT Payload Upgrade:** Updated `JwtStrategy` and the payload typing to explicitly include and extract the user's `role`, bridging the gap between the JWT token and the `RolesGuard`.

## Commit 4:

- **PROGRESS.md minor update**

Here is an updated version of your commit message that accurately reflects all the recent bug fixes, architectural changes, and the new Admin features we just built:

---

## Commit 5:

- **Admin Approval Workflows:** Implemented exact proposal-compliant action endpoints for Admins to approve or reject Vendors and Products (`PATCH /admin/users/:id/approve` and `PATCH /admin/products/:id/approve`). Hardcoded state updates (`isApproved: true/false`) securely within the Service layer.
- **Route Restructuring & Alignment:** Refactored `UsersController` and `ProductsController` base route decorators to eliminate nested URL paths (e.g., fixing `404 Not Found` and double-nested paths). Routes now perfectly match the project proposal specifications (e.g., `/auth/register`, `/products`).
- **Entity Relationships & Circular Dependencies Fixed:** Successfully linked `User`, `Product`, and `Order` entities using TypeORM's `@OneToMany` and `@ManyToOne` decorators. Implemented the `Relation<T>` wrapper to lazily load relations and prevent SWC compiler crashes.
- **Vendor Product Creation & Validation:** Built the `ProductsService.create()` method to automatically map newly uploaded products to the `vendorId` extracted from the requesting user's JWT payload. Enforced strict data rules (`@IsPositive` for price, `@Min(0)` for stock) using `CreateProductDto`.
