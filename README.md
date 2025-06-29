# E-Commerce Admin Dashboard

A modern e-commerce admin dashboard built with Next.js, SQLite, and shadcn/ui components. This project provides a complete product management system with user authentication and a responsive dashboard interface.

## 🚀 Features

- **User Authentication** - Secure login and signup system with role-based access
- **Product Management** - Full CRUD operations (Create, Read, Update, Delete)
- **E-commerce Storefront** - A customer-facing store to browse and purchase products
- **Shopping Cart** - Fully functional cart for users to add items to
- **Dashboard Analytics** - Real-time stats and inventory tracking
- **Responsive Design** - Modern UI built with shadcn/ui components
- **SQLite Database** - Lightweight, embedded database with auto-initialization
- **Robust Form Validation** - Comprehensive client-side validation with password strength policies

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL (with Docker) or SQLite (for local development)
- **Authentication**: bcryptjs for password hashing
- **Containerization**: Docker, Docker Compose

## 📋 Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun package manager
- Docker and Docker Compose

## 🚀 Getting Started

### Standard Local Development

1. **Clone the repository**

   ```bash
   git clone git@github.com:Danor93/ecommerce-cicd-pipeline.git
   cd ecommerce-cicd-pipeline
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open the application**

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Docker-Based Development

This is the recommended approach for a consistent development environment that mirrors production.

1. **Clone the repository**

   ```bash
   git clone git@github.com:Danor93/ecommerce-cicd-pipeline.git
   cd ecommerce-cicd-pipeline
   ```

2. **Create an environment file**

   Create a `.env` file in the project root and add the following variables:

   ```env
   # Application Port
   APP_PORT=3000

   # PostgreSQL Database
   POSTGRES_USER=myuser
   POSTGRES_PASSWORD=mypassword
   POSTGRES_DB=mydatabase
   ```

3. **Run with Docker Compose**

   ```bash
   docker-compose up --build
   ```

4. **Open the application**

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🗄️ Database Setup

### Docker (PostgreSQL)

**No manual setup required!** When using Docker Compose, the database will automatically:

- Create a PostgreSQL container
- Create the necessary tables from the `init.sql` script
- Seed initial data on the application's first run

### Local (SQLite)

If you are not using Docker, the database will automatically:

- Create an SQLite database file (`ecommerce.db`) in the project root
- Create the necessary tables (`users`, `products`, `cart`)
- Seed initial data on first run

### Initial Users (Auto-seeded)

| Email             | Password | Role  |
| ----------------- | -------- | ----- |
| admin@example.com | admin123 | admin |
| john@example.com  | john123  | user  |

### Initial Products

The database comes pre-loaded with 8 sample products across different categories (Electronics, Office, Appliances, Accessories).

## 🔐 Login

1. Navigate to [http://localhost:3000/login](http://localhost:3000/login)
2. Use any of the credentials above (recommended: `admin@example.com` / `admin123`)
3. You'll be redirected to the admin panel

## 📱 Using the Admin Panel

### Product Management

- **View Products**: See all products in a table with stock status indicators
- **Add Product**: Click "Add Product" button to create new products
- **Edit Product**: Click the ⋮ menu next to any product → "Edit"
- **Delete Product**: Click the ⋮ menu next to any product → "Delete"

### Features

- **Form Validation**: All forms include comprehensive validation
- **Loading States**: Visual feedback during API operations
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on desktop and mobile devices

### Dashboard

- `GET /api/dashboard` - Get dashboard statistics

## 🌐 API Endpoints

The application provides RESTful API endpoints:

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User signup

### Products (Admin)

- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get product by ID
- `PUT /api/products/[id]` - Update product by ID
- `DELETE /api/products/[id]` - Delete product by ID
- `GET /api/products/categories` - Get all unique product categories

### Store & Cart (Client)

- `GET /api/store/products` - Get all products for the storefront
- `GET /api/store/categories` - Get all categories for the storefront
- `GET /api/cart` - Get user's shopping cart
- `POST /api/cart` - Add item to cart

### Dashboard

- `GET /api/dashboard` - Get dashboard statistics
- `GET /api/health` - Health check endpoint

## 📁 Project Structure

```
src/
├── app/
│   ├── api/           # API routes (auth, products, store, etc.)
│   ├── admin-panel/   # Admin dashboard page
│   ├── cart/          # Shopping cart page
│   ├── login/         # Login page
│   ├── signup/        # Signup page
│   ├── store/         # Customer-facing store page
│   └── ...
├── components/        # Reusable components
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom React hooks (e.g., useMounted)
├── lib/               # Core libraries (database, utils, toast)
└── types/             # TypeScript definitions
```

## 🔧 Development

### File Structure

- **Database**: `src/lib/database.ts` & `src/lib/db.ts` - SQLite setup
- **Types**: `src/types/index.ts` - TypeScript interfaces
- **API Routes**: `src/app/api/` - Next.js API routes
- **Components**: `src/components/` - Reusable UI components
- **Hooks**: `src/hooks/` - Custom hooks for client-side logic

### Adding New Features

1. Define types in `src/types/index.ts`
2. Create API routes in `src/app/api/`
3. Add database methods in `src/lib/database.ts`
4. Build UI components using shadcn/ui

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Deploy automatically

### Manual Deployment

1. Build the project: `npm run build`
2. Start production server: `npm start`

**Note**: Ensure the database file permissions are properly set for production environments.

## 🛠️ Troubleshooting

### Database Issues

- **Database not created**: Ensure write permissions in project directory
- **Seeding failed**: Check console logs for bcrypt or SQLite errors
- **Connection errors**: Restart the development server

### Common Issues

- **Module not found**: Run `npm install` to ensure all dependencies are installed
- **Port already in use**: Change the port or kill the process using port 3000
- **TypeScript errors**: Run `npm run build` to check for type errors

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [shadcn/ui](https://ui.shadcn.com/) - Learn about the UI component library
- [SQLite Documentation](https://www.sqlite.org/docs.html) - Learn about SQLite database
- [Tailwind CSS](https://tailwindcss.com/docs) - Learn about utility-first CSS framework
