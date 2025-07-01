# E-Commerce Admin Dashboard

> **Quick Kubernetes Setup:**
>
> ```bash
> # one-liner to deploy, inspect, or tear-down everything via interactive menu
> cd k8s && ./menu.sh
> ```
>
> The menu will guide you through deployment, live status checks, and cleanup in a few keystrokes.

A modern, containerized e-commerce admin dashboard built with Next.js, PostgreSQL, and Docker. This project provides a complete product management system with user authentication, all running in a consistent and reproducible development environment.

## 🚀 Features

- **Containerized Environment** - Develop and run the application consistently with Docker and Docker Compose.
- **User Authentication** - Secure login and signup system with role-based access
- **Product Management** - Full CRUD operations (Create, Read, Update, Delete)
- **E-commerce Storefront** - A customer-facing store to browse and purchase products
- **Shopping Cart** - Fully functional cart for users to add items to
- **Dashboard Analytics** - Real-time stats and inventory tracking
- **Responsive Design** - Modern UI built with shadcn/ui components
- **PostgreSQL Database** - Robust, production-ready database with automated initialization.
- **Robust Form Validation** - Comprehensive client-side validation with password strength policies

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL
- **Authentication**: bcryptjs for password hashing
- **Containerization**: Docker, Docker Compose

## 🚀 Quick Start

**📖 For complete installation and Jenkins CI/CD pipeline setup instructions, see the [INSTALL.md](./INSTALL.md) guide.**

The INSTALL.md guide covers:

- ✅ Prerequisites and system requirements
- ✅ Docker & application setup
- ✅ Jenkins CI/CD pipeline configuration
- ✅ GitHub and Docker Hub credentials setup
- ✅ Database configuration
- ✅ Troubleshooting and security considerations

### Quick Launch (TL;DR)

    ```bash

git clone https://github.com/Danor93/ecommerce-cicd-pipeline.git
cd ecommerce-cicd-pipeline
cp .env.example .env
docker-compose up --build -d

````

- **Application**: [http://localhost:3000](http://localhost:3000)
- **Jenkins**: [http://localhost:8080](http://localhost:8080)
- **Login**: admin@example.com / admin123

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

```text
.
├── k8s/                         # Kubernetes resources & helper scripts
│   ├── manifests/               # YAML manifests (namespace, deployments, PV, etc.)
│   ├── deploy.sh                # Automates deployment to Minikube
│   ├── status.sh                # Shows detailed status overview
│   ├── cleanup.sh               # Cleans up namespace / cluster resources
│   └── menu.sh                  # Interactive menu (deploy · status · cleanup)
├── src/                         # Next.js application source
│   ├── app/                     # API routes & pages
│   ├── components/              # Reusable UI components
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility & DB helpers
│   └── types/                   # TypeScript definitions
├── Jenkinsfile                  # Jenkins CI/CD pipeline
├── Dockerfile                   # Docker build for Next.js app
├── docker-compose.yml           # Local Docker development stack
└── README.md                    # This file
````

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
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - Learn about PostgreSQL database
- [Tailwind CSS](https://tailwindcss.com/docs) - Learn about utility-first CSS framework

```

```
