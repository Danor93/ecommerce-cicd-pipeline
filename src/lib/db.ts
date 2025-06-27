import { User, Product, DashboardStats } from "@/types";

// Mock data for development
const mockUsers: User[] = [
  {
    id: 1,
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    email: "user@example.com",
    name: "Regular User",
    role: "user",
    createdAt: new Date().toISOString(),
  },
];

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 299.99,
    stock: 25,
    category: "Electronics",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Smart Watch",
    description: "Advanced smartwatch with health monitoring",
    price: 199.99,
    stock: 15,
    category: "Electronics",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Coffee Maker",
    description: "Automatic coffee maker with programmable settings",
    price: 89.99,
    stock: 8,
    category: "Appliances",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Bluetooth Speaker",
    description: "Portable bluetooth speaker with excellent sound quality",
    price: 59.99,
    stock: 32,
    category: "Electronics",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Desk Lamp",
    description: "LED desk lamp with adjustable brightness",
    price: 39.99,
    stock: 5,
    category: "Office",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class MockDatabase {
  // User methods
  static async findUserByEmail(email: string): Promise<User | null> {
    return mockUsers.find((user) => user.email === email) || null;
  }

  static async validateUser(
    email: string,
    password: string
  ): Promise<User | null> {
    // Simple mock validation (in real app, hash passwords)
    if (email === "admin@example.com" && password === "admin123") {
      return mockUsers[0];
    }
    if (email === "user@example.com" && password === "user123") {
      return mockUsers[1];
    }
    return null;
  }

  // Product methods
  static async getAllProducts(): Promise<Product[]> {
    return [...mockProducts];
  }

  static async getProductById(id: number): Promise<Product | null> {
    return mockProducts.find((product) => product.id === id) || null;
  }

  static async createProduct(
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): Promise<Product> {
    const newProduct: Product = {
      ...productData,
      id: Math.max(...mockProducts.map((p) => p.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProducts.push(newProduct);
    return newProduct;
  }

  static async updateProduct(
    id: number,
    productData: Partial<Omit<Product, "id" | "createdAt">>
  ): Promise<Product | null> {
    const productIndex = mockProducts.findIndex((p) => p.id === id);
    if (productIndex === -1) return null;

    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...productData,
      updatedAt: new Date().toISOString(),
    };
    return mockProducts[productIndex];
  }

  static async deleteProduct(id: number): Promise<boolean> {
    const productIndex = mockProducts.findIndex((p) => p.id === id);
    if (productIndex === -1) return false;

    mockProducts.splice(productIndex, 1);
    return true;
  }

  // Dashboard stats
  static async getDashboardStats(): Promise<DashboardStats> {
    const totalProducts = mockProducts.length;
    const totalRevenue = mockProducts.reduce(
      (sum, product) => sum + product.price * (50 - product.stock),
      0
    );
    const totalOrders = 127; // Mock value
    const lowStockItems = mockProducts.filter(
      (product) => product.stock < 10
    ).length;

    return {
      totalProducts,
      totalRevenue,
      totalOrders,
      lowStockItems,
    };
  }
}
