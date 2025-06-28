import sqlite3 from "sqlite3";
import {
  User,
  Product,
  DashboardStats,
  CartItem,
  CartItemWithProduct,
} from "@/types";
import bcrypt from "bcryptjs";

const DB_PATH = "./ecommerce.db";

interface CountResult {
  count: number;
}

interface UserFromDb {
  id: number;
  email: string;
  name: string;
  password?: string;
  role: "admin" | "user";
  created_at: string;
}

interface ProductFromDb {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

interface CategoryFromDb {
  category: string;
}

interface CartItemFromDb extends CartItem {
  productName: string;
  productDescription: string;
  productPrice: number;
  productImage: string;
}

interface DashboardStatRow {
  totalProducts?: number;
  totalRevenue?: number;
  totalOrders?: number;
  lowStockItems?: number;
}

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

        // Create cart items table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
          )
        `);

        // Create orders table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'completed',
            ordered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
          )
        `);

        // Create order items table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
          )
        `);

        // Check if users exist, if not, seed initial data
        this.db.get(
          "SELECT COUNT(*) as count FROM users",
          async (err, row: CountResult) => {
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
        (err, row: UserFromDb) => {
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
        async (err, row: UserFromDb) => {
          if (err) {
            reject(err);
            return;
          }

          if (!row || !row.password) {
            resolve(null);
            return;
          }

          const isPasswordValid = await bcrypt.compare(password, row.password);
          if (!isPasswordValid) {
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
      this.db.all("SELECT * FROM products", (err, rows: ProductFromDb[]) => {
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
      });
    });
  }

  async getProductById(id: number): Promise<Product | null> {
    await this.initialized;
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT * FROM products WHERE id = ?",
        [id],
        (err, row: ProductFromDb) => {
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

  async getUniqueProductCategories(): Promise<string[]> {
    await this.initialized;
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT DISTINCT category FROM products",
        (err, rows: CategoryFromDb[]) => {
          if (err) {
            reject(err);
            return;
          }
          const categories = rows.map((row) => row.category);
          resolve(categories);
        }
      );
    });
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItemWithProduct[]> {
    await this.initialized;
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          ci.*,
          p.name as productName,
          p.description as productDescription,
          p.price as productPrice,
          p.image as productImage
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = ?
      `;
      this.db.all(query, [userId], (err, rows: CartItemFromDb[]) => {
        if (err) {
          reject(err);
          return;
        }
        const cartItems: CartItemWithProduct[] = rows.map((row) => ({
          id: row.id,
          user_id: row.user_id,
          product_id: row.product_id,
          quantity: row.quantity,
          product: {
            id: row.product_id,
            name: row.productName,
            description: row.productDescription,
            price: row.productPrice,
            stock: 0, // Not fetched in this query, decide if needed
            category: "", // Not fetched in this query
            image: row.productImage,
            createdAt: "", // Not fetched
            updatedAt: "", // Not fetched
          },
        }));
        resolve(cartItems);
      });
    });
  }

  async addToCart(data: {
    userId: number;
    productId: number;
    quantity: number;
  }): Promise<CartItem> {
    await this.initialized;
    return new Promise((resolve, reject) => {
      // Check if item already in cart
      this.db.get(
        "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?",
        [data.userId, data.productId],
        (err, row: CartItem) => {
          if (err) return reject(err);
          if (row) {
            // Update quantity
            const newQuantity = row.quantity + data.quantity;
            this.db.run(
              "UPDATE cart_items SET quantity = ? WHERE id = ?",
              [newQuantity, row.id],
              (err) => {
                if (err) return reject(err);
                resolve({ ...row, quantity: newQuantity });
              }
            );
          } else {
            // Insert new item
            this.db.run(
              "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
              [data.userId, data.productId, data.quantity],
              function (err) {
                if (err) return reject(err);
                resolve({
                  id: this.lastID,
                  user_id: data.userId,
                  product_id: data.productId,
                  quantity: data.quantity,
                });
              }
            );
          }
        }
      );
    });
  }

  async updateCartItemQuantity(
    cartItemId: number,
    quantity: number
  ): Promise<void> {
    await this.initialized;
    return new Promise((resolve, reject) => {
      if (quantity > 0) {
        this.db.run(
          "UPDATE cart_items SET quantity = ? WHERE id = ?",
          [quantity, cartItemId],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      } else {
        // Remove item if quantity is 0 or less
        this.removeCartItem(cartItemId).then(resolve).catch(reject);
      }
    });
  }

  async removeCartItem(cartItemId: number): Promise<void> {
    await this.initialized;
    return new Promise((resolve, reject) => {
      this.db.run(
        "DELETE FROM cart_items WHERE id = ?",
        [cartItemId],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  async clearCart(userId: number): Promise<void> {
    await this.initialized;
    return new Promise((resolve, reject) => {
      this.db.run(
        "DELETE FROM cart_items WHERE user_id = ?",
        [userId],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  // Dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    await this.initialized;
    const stats: DashboardStats = {
      totalProducts: 0,
      totalRevenue: 0,
      totalOrders: 0,
      lowStockItems: 0,
    };

    const promises = [
      new Promise<void>((resolve, reject) => {
        this.db.get(
          "SELECT COUNT(*) as totalProducts FROM products",
          (err, row: DashboardStatRow) => {
            if (err) return reject(err);
            stats.totalProducts = row.totalProducts || 0;
            resolve();
          }
        );
      }),
      new Promise<void>((resolve, reject) => {
        this.db.get(
          "SELECT SUM(total_amount) as totalRevenue FROM orders WHERE status = 'completed'",
          (err, row: DashboardStatRow) => {
            if (err) return reject(err);
            stats.totalRevenue = row.totalRevenue || 0;
            resolve();
          }
        );
      }),
      new Promise<void>((resolve, reject) => {
        this.db.get(
          "SELECT COUNT(*) as totalOrders FROM orders",
          (err, row: DashboardStatRow) => {
            if (err) return reject(err);
            stats.totalOrders = row.totalOrders || 0;
            resolve();
          }
        );
      }),
      new Promise<void>((resolve, reject) => {
        this.db.get(
          "SELECT COUNT(*) as lowStockItems FROM products WHERE stock < 10",
          (err, row: DashboardStatRow) => {
            if (err) return reject(err);
            stats.lowStockItems = row.lowStockItems || 0;
            resolve();
          }
        );
      }),
    ];

    await Promise.all(promises);
    return stats;
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
