# E-Commerce Admin Dashboard

A modern e-commerce admin dashboard built with Next.js, SQLite, and shadcn/ui components. This project provides a complete product management system with user authentication and a responsive dashboard interface.

## 🚀 Features

- **User Authentication** - Login system with role-based access
- **Product Management** - Full CRUD operations (Create, Read, Update, Delete)
- **Dashboard Analytics** - Real-time stats and inventory tracking
- **Responsive Design** - Modern UI built with shadcn/ui components
- **SQLite Database** - Lightweight, embedded database with auto-initialization
- **Form Validation** - Comprehensive client-side and server-side validation

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: SQLite with sqlite3
- **Authentication**: bcryptjs for password hashing

## 📋 Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun package manager

## 🚀 Getting Started

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
   # or
   pnpm install
   # or
   bun install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open the application**

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🗄️ Database Setup

**No manual setup required!** The database will automatically:

- Create an SQLite database file (`ecommerce.db`) in the project root
- Create the necessary tables (`users` and `products`)
- Seed initial data on first run

### Initial Users (Auto-seeded)

| Email               | Password   | Role  |
| ------------------- | ---------- | ----- |
| admin@example.com   | admin123   | admin |
| john@example.com    | john123    | user  |
| jane@example.com    | jane123    | user  |
| manager@example.com | manager123 | admin |

### Initial Products

The database comes pre-loaded with 8 sample products across different categories (Electronics, Office, Appliances, Accessories).

## 🔐 Login

1. Navigate to [http://localhost:3000/login](http://localhost:3000/login)
2. Use any of the credentials above (recommended: `admin@example.com` / `admin123`)
3. You'll be redirected to the dashboard

## 📱 Using the Dashboard

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

## 🌐 API Endpoints

The application provides RESTful API endpoints:

### Authentication

- `POST /api/auth/login` - User login

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get product by ID
- `PUT /api/products/[id]` - Update product by ID
- `DELETE /api/products/[id]` - Delete product by ID

### Dashboard

- `GET /api/dashboard` - Get dashboard statistics

## 📁 Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── dashboard/     # Dashboard page
│   ├── login/         # Login page
│   └── ...
├── components/ui/     # shadcn/ui components
├── lib/               # Database and utilities
└── types/             # TypeScript definitions
```

## 🔧 Development

### File Structure

- **Database**: `src/lib/database.ts` - SQLite database setup and operations
- **Types**: `src/types/index.ts` - TypeScript interfaces
- **API Routes**: `src/app/api/` - Next.js API routes
- **Components**: `src/components/ui/` - Reusable UI components

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
