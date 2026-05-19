# B2B Marketplace Platform

A robust, full-stack B2B (Business-to-Business) marketplace application designed to connect wholesale buyers with verified vendors. The platform includes secure role-based access control, product management, order tracking, and a dedicated administrative portal for marketplace moderation.

## 🚀 Tech Stack

**Frontend:**
* Next.js (App Router)
* React 18
* Pure Tailwind CSS (No component libraries)
* Axios (Data fetching)

**Backend:**
* NestJS
* JWT (JSON Web Tokens) Authentication
* Class Validator & Class Transformer
* PostgreSQL / MySQL (via TypeORM/Prisma)

---

## ✨ Key Features by Role

### 🛒 Buyer
* Browse the public marketplace for approved products.
* View detailed product information and vendor details.
* Place orders with dynamic quantity calculations.
* Track order statuses (Pending, Shipped, Delivered, Cancelled) on a dedicated `My Orders` dashboard.
* Update personal profile and secure credentials.

### 🏪 Vendor
* **Approval System:** New vendor accounts are restricted until an Admin approves them.
* **Product Management:** Create and manage products (requires Admin approval before appearing on the marketplace).
* **Inventory & Pricing:** Set initial stock and wholesale pricing.
* **Order Fulfillment:** View incoming orders and update fulfillment statuses (Pending → Shipped → Delivered).
* **Vendor Dashboard:** A dedicated portal (`/vendor/products`) with isolated sidebar navigation.

### 🛡️ Admin
* **User Moderation:** View all registered vendors and approve/reject their marketplace access.
* **Product Moderation:** Review newly created products and approve/reject them for public listing.
* **Admin Dashboard:** A dedicated administrative portal (`/admin/users`) for platform governance.

---

## 🛠️ How to Run the Project Locally

### Prerequisites
* Node.js (v18 or higher)
* A running SQL Database (PostgreSQL/MySQL)

### 1. Backend Setup (NestJS)
1. Open your terminal and navigate to the backend directory.
2. Install the dependencies:
   ```bash
   npm install

```

3. Create a `.env` file in the root of the backend directory and add your environment variables:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=b2b_marketplace

# Authentication
JWT_SECRET=your_super_secret_jwt_key

```


4. Run database migrations/sync (depending on your ORM setup).
5. Start the development server:
```bash
npm run start:dev

```


*The backend will run on `http://localhost:3000`.*

### 2. Frontend Setup (Next.js)

1. Open a new terminal window and navigate to the frontend directory.
2. Install the dependencies:
```bash
npm install

```


3. Start the Next.js development server:
```bash
npm run dev

```


*The frontend will run on `http://localhost:3001` (or 3000 if the backend isn't occupying it).*

### 3. Testing the Application

1. Open your browser and go to the frontend URL.
2. Register a new user as an **Admin** directly in the database (or via registration if configured).
3. Register a new user as a **Vendor**.
4. Log in as the Admin to approve the Vendor.
5. Log in as the Vendor, create a product, and wait for Admin approval.
6. Register/Log in as a **Buyer** to purchase the product!

---

## 📝 Commit Logging Methodology

This project utilized a structured, iterative commit history to ensure stability and logical progression. Commits were categorized by vertical slices of features rather than horizontal architecture.

**Logging Strategy:**

* **`[Auth]`**: Commits related to JWT strategies, login/register forms, and role-based route protection.
* **`[Core/UI]`**: Implementation of the pure Tailwind CSS design system, responsive layouts, and shared components (sidebars, navbars).
* **`[Feature: Role]`**: Dedicated commits for role-specific workflows (e.g., `[Feature: Vendor] Added product creation and order status updates`).
* **`[Fix]`**: Targeted commits for resolving bugs (e.g., routing 404s, 403 Forbidden errors, and strict Enum type matching).

**Milestone Highlight - Commit #12:**
The final major commit (Commit 12) finalized the portal architectures, implemented dynamic role-based smart routing (automatically sending Admins to `/admin/users` and Vendors to `/vendor/products`), and resolved critical backend-to-frontend Enum mapping bugs for order status updates.

---

## 🗺️ Future Roadmap

* **Image Uploads:** Implementation of a media bucket (AWS S3 or Cloudinary) to allow vendors to upload product images (currently utilizing UI placeholders).
* **Refresh Token Rotation:** Upgrade the authentication flow to include HTTP-only refresh cookies for seamless, long-term user sessions without compromising JWT secret security.
* **Analytics Dashboard:** Visual charts for vendors to track monthly revenue and order volume.

```

```