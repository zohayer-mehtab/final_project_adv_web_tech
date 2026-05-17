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

## Commit 5:

- **Admin Approval Workflows:** Implemented exact proposal-compliant action endpoints for Admins to approve or reject Vendors and Products (`PATCH /admin/users/:id/approve` and `PATCH /admin/products/:id/approve`). Hardcoded state updates (`isApproved: true/false`) securely within the Service layer.
- **Route Restructuring & Alignment:** Refactored `UsersController` and `ProductsController` base route decorators to eliminate nested URL paths (e.g., fixing `404 Not Found` and double-nested paths). Routes now perfectly match the project proposal specifications (e.g., `/auth/register`, `/products`).
- **Entity Relationships & Circular Dependencies Fixed:** Successfully linked `User`, `Product`, and `Order` entities using TypeORM's `@OneToMany` and `@ManyToOne` decorators. Implemented the `Relation<T>` wrapper to lazily load relations and prevent SWC compiler crashes.
- **Vendor Product Creation & Validation:** Built the `ProductsService.create()` method to automatically map newly uploaded products to the `vendorId` extracted from the requesting user's JWT payload. Enforced strict data rules (`@IsPositive` for price, `@Min(0)` for stock) using `CreateProductDto`.

## Commit 6:

- **Made updates to PROGRESS.md. Accidentally added some AI-generated text. Noticed after making this commit. I'm writing this after commit commit no.6**

## Commit 7:

- **Public Catalog Management:** Implemented buyer-facing endpoints `GET /products` and `GET /products/:id` to fetch approved, in-stock marketplace listings. Integrated strict `NotFoundException` error handling to block access to unapproved or non-existent items, while utilizing modern TypeORM 0.3.x object selection to protect sensitive vendor entity fields (passwords and emails).
- **Vendor Inventory Isolation:** Created the authenticated `GET /products/my-products` endpoint, enforcing strict route-ordering in the controller to prevent path conflicts. This allows vendors to review their entire product portfolio, including both active (approved) and hidden (pending) items.
- **Race-Condition Safe Orders:** Built out the core `POST /orders` logic for authenticated buyers. Replaced stateful JavaScript math with TypeORM's database-level `.decrement()` operation to guarantee atomic inventory updates, eliminating transaction concurrency issues (race conditions) during high-traffic checkouts.
- **Relational Type Integrity:** Enforced `DeepPartial` casting across order relations (`Product` and `User`), allowing lightweight entity reference linking via IDs while maintaining strict compiler type-safety without unnecessary database overhead.

## Commit 8:

- **Transactional Email System:** Integrated `@nestjs-modules/mailer` with Handlebars templates using the `forRootAsync` pattern and `ConfigService` for safe, race-condition-free startup.
- **Fault-Tolerant Checkout:** Successfully wired automated emails (Order Confirmation to Buyer, Product Sold to Vendor) into the checkout flow. Implemented strategic rate-limiting delays and `try/catch` error handling to ensure third-party SMTP failures do not block or crash successful database transactions.
- **Secure Order Management:** Built the authenticated `PATCH /orders/:id/status` endpoint allowing vendors to update delivery states (`Pending`, `Shipped`, `Delivered`).
- **Strict Authorization Checks:** Enforced deep relational queries to verify product ownership, throwing a `ForbiddenException` to guarantee vendors can only modify orders containing their own inventory.

## Commit 9: 

- **Profile Retrieval:** Implemented the protected `GET /auth/me` endpoint to securely fetch the currently authenticated user's profile data using JWT payload extraction.
- **Profile Updates:** Built the `PATCH /auth/me` endpoint, allowing users to update their account details (username, company name, etc.) without requiring them to pass their ID in the URL.
- **Secure Password Modification:** Integrated `bcrypt` hashing directly into the `UsersService.update` method to ensure that if a user changes their password during a profile update, the new password is encrypted before saving to the database.
- **Routing & Type Fixes:** Resolved controller decorator routing issues (`@Patch`) and corrected JWT payload property mapping (`userId`).


## Commit 10:

* **Password Recovery:** Implemented secure two-step forgot/reset password flow using crypto-generated 6-digit tokens, 15-minute expirations, and automated Handlebars email delivery.
* **Security Patch:** Resolved a bcrypt double-hashing bug in the password reset pipeline by delegating hash generation entirely to the `UsersService.update` lifecycle.
* **Vendor Order Management:** Built the `GET /orders/vendor-orders` endpoint with deeply nested TypeORM relational queries, allowing vendors to securely view all inbound orders specifically for their inventory.
* **Backend Finalization:** Concluded primary API development for the B2B Marketplace.