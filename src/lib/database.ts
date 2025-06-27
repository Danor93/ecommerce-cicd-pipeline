import sqlite3 from "sqlite3";
import { User, Product, DashboardStats } from "@/types";
import bcrypt from "bcryptjs";

const DB_PATH = "./ecommerce.db";

class Database {
  private db: sqlite3.Database;
  private initialized: Promise<void>;

  constructor() {
    this.db = new sqlite3.Database(DB_PATH);
    this.initialized = this.initialize();
  }

  private async initialize() {
    return new Promise<void>((resolve, reject) => {
      this.db.serialize(() => {
        // Create users table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create products table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            category TEXT,
            image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Check if users exist, if not, seed initial data
        this.db.get(
          "SELECT COUNT(*) as count FROM users",
          async (err, row: any) => {
            if (err) {
              reject(err);
              return;
            }

            if (row.count === 0) {
              await this.seedInitialData();
            }
            resolve();
          }
        );
      });
    });
  }

  private async seedInitialData() {
    const users = [
      {
        email: "admin@example.com",
        name: "Admin User",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
      },
      {
        email: "john@example.com",
        name: "John Doe",
        password: await bcrypt.hash("john123", 10),
        role: "user",
      },
      {
        email: "jane@example.com",
        name: "Jane Smith",
        password: await bcrypt.hash("jane123", 10),
        role: "user",
      },
      {
        email: "manager@example.com",
        name: "Store Manager",
        password: await bcrypt.hash("manager123", 10),
        role: "admin",
      },
    ];

    const products = [
      {
        name: "Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 299.99,
        stock: 25,
        category: "Electronics",
      },
      {
        name: "Smart Watch",
        description: "Advanced smartwatch with health monitoring",
        price: 199.99,
        stock: 15,
        category: "Electronics",
      },
      {
        name: "Coffee Maker",
        description: "Automatic coffee maker with programmable settings",
        price: 89.99,
        stock: 8,
        category: "Appliances",
      },
      {
        name: "Bluetooth Speaker",
        description: "Portable bluetooth speaker with excellent sound quality",
        price: 59.99,
        stock: 32,
        category: "Electronics",
      },
      {
        name: "Desk Lamp",
        description: "LED desk lamp with adjustable brightness",
        price: 39.99,
        stock: 5,
        category: "Office",
      },
      {
        name: "Laptop Stand",
        description: "Ergonomic laptop stand for better posture",
        price: 49.99,
        stock: 18,
        category: "Office",
      },
      {
        name: "Wireless Mouse",
        description: "Ergonomic wireless mouse with precision tracking",
        price: 29.99,
        stock: 45,
        category: "Electronics",
      },
      {
        name: "Phone Case",
        description: "Protective phone case with shock absorption",
        price: 19.99,
        stock: 3,
        category: "Accessories",
      },
    ];

    // Insert users
    for (const user of users) {
      await new Promise<void>((resolve, reject) => {
        this.db.run(
          "INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)",
          [user.email, user.name, user.password, user.role],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Insert products
    for (const product of products) {
      await new Promise<void>((resolve, reject) => {
        this.db.run(
          "INSERT INTO products (name, description, price, stock, category) VALUES (?, ?, ?, ?, ?)",
          [
            product.name,
            product.description,
            product.price,
            product.stock,
            product.category,
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
  }

  // User methods
  async findUserByEmail(email: string): Promise<User | null> {
    await this.initialized;
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }

          if (!row) {
            resolve(null);
            return;
          }

          resolve({
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.role,
            createdAt: row.created_at,
          });
        }
      );
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    await this.initialized;
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }

          if (!row) {
            resolve(null);
            return;
          }

          const isValid = await bcrypt.compare(password, row.password);
          if (!isValid) {
            resolve(null);
            return;
          }

          resolve({
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.role,
            createdAt: row.created_at,
          });
        }
      );
    });
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    await this.initialized;
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT * FROM products ORDER BY created_at DESC",
        [],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
            return;
          }

          const products = rows.map((row) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            price: row.price,
            stock: row.stock,
            category: row.category,
            image: row.image,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));

          resolve(products);
        }
      );
    });
  }

  async getProductById(id: number): Promise<Product | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT * FROM products WHERE id = ?",
        [id],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }

          if (!row) {
            resolve(null);
            return;
          }

          resolve({
            id: row.id,
            name: row.name,
            description: row.description,
            price: row.price,
            stock: row.stock,
            category: row.category,
            image: row.image,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          });
        }
      );
    });
  }

  async createProduct(
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): Promise<Product> {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO products (name, description, price, stock, category, image) VALUES (?, ?, ?, ?, ?, ?)",
        [
          productData.name,
          productData.description,
          productData.price,
          productData.stock,
          productData.category,
          productData.image,
        ],
        function (err) {
          if (err) {
            reject(err);
            return;
          }

          // Get the created product
          resolve({
            id: this.lastID,
            ...productData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      );
    });
  }

  async updateProduct(
    id: number,
    productData: Partial<Omit<Product, "id" | "createdAt">>
  ): Promise<Product | null> {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      for (const [key, value] of Object.entries(productData)) {
        if (key !== "id" && key !== "createdAt") {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) {
        resolve(null);
        return;
      }

      fields.push("updated_at = ?");
      values.push(new Date().toISOString());
      values.push(id);

      this.db.run(
        `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
        values,
        async (err) => {
          if (err) {
            reject(err);
            return;
          }

          const updatedProduct = await this.getProductById(id);
          resolve(updatedProduct);
        }
      );
    });
  }

  async deleteProduct(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
        if (err) {
          reject(err);
          return;
        }

        resolve(this.changes > 0);
      });
    });
  }

  // Dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    await this.initialized;
    return new Promise((resolve, reject) => {
      const stats: Partial<DashboardStats> = {};

      // Get total products
      this.db.get("SELECT COUNT(*) as count FROM products", (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }
        stats.totalProducts = row.count;

        // Get low stock items
        this.db.get(
          "SELECT COUNT(*) as count FROM products WHERE stock < 10",
          (err, row: any) => {
            if (err) {
              reject(err);
              return;
            }
            stats.lowStockItems = row.count;

            // Calculate total revenue (mock calculation based on sold items)
            this.db.get(
              "SELECT SUM(price * (50 - stock)) as revenue FROM products",
              (err, row: any) => {
                if (err) {
                  reject(err);
                  return;
                }
                stats.totalRevenue = row.revenue || 0;
                stats.totalOrders = 156; // Mock value

                resolve(stats as DashboardStats);
              }
            );
          }
        );
      });
    });
  }

  close() {
    this.db.close();
  }
}

// Singleton instance
let dbInstance: Database | null = null;

export function getDatabase(): Database {
  if (!dbInstance) {
    dbInstance = new Database();
  }
  return dbInstance;
}
