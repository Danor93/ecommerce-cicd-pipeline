import { Pool, PoolClient } from "pg";
import {
  User,
  Product,
  DashboardStats,
  CartItem,
  CartItemWithProduct,
} from "@/types";
import bcrypt from "bcryptjs";

// Define interfaces for raw database results
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

interface CartItemFromDb {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  productName: string;
  productDescription: string;
  productPrice: number;
  productImage: string;
}

interface CategoryFromDb {
  category: string;
}

// Create a connection pool.
// The connection string is read from the DATABASE_URL environment variable.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

class Database {
  private static instance: Database;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private async executeQuery(query: string, params: unknown[] = []) {
    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      const result = await client.query(query, params);
      return result.rows;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    } finally {
      client?.release();
    }
  }

  private async initialize() {
    try {
      const users = await this.executeQuery(
        "SELECT COUNT(*) as count FROM users"
      );
      if (users[0].count === "0") {
        await this.seedInitialData();
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
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
    ];

    for (const user of users) {
      await this.executeQuery(
        "INSERT INTO users (email, name, password, role) VALUES ($1, $2, $3, $4)",
        [user.email, user.name, user.password, user.role]
      );
    }

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
    ];

    for (const product of products) {
      await this.executeQuery(
        "INSERT INTO products (name, description, price, stock, category) VALUES ($1, $2, $3, $4, $5)",
        [
          product.name,
          product.description,
          product.price,
          product.stock,
          product.category,
        ]
      );
    }
  }

  // User methods
  async findUserByEmail(email: string): Promise<User | null> {
    const rows = await this.executeQuery(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (rows.length === 0) return null;
    const user = rows[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role,
      createdAt: user.created_at,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findUserByEmail(email);
    if (!user || !user.password) return null;
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    return user;
  }

  async createUser(
    user: Omit<User, "id" | "createdAt" | "password">,
    hashedPassword?: string
  ): Promise<User> {
    const { email, name, role } = user;
    const rows = await this.executeQuery(
      "INSERT INTO users (email, name, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [email, name, hashedPassword, role || "user"]
    );
    const newUser = rows[0];
    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      password: newUser.password,
      role: newUser.role,
      createdAt: newUser.created_at,
    };
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    const rows = await this.executeQuery(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    return rows.map((row: ProductFromDb) => ({
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
  }

  async getProductById(id: number): Promise<Product | null> {
    const rows = await this.executeQuery(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      stock: row.stock,
      category: row.category,
      image: row.image,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async createProduct(
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): Promise<Product> {
    const { name, description, price, stock, category, image } = productData;
    const rows = await this.executeQuery(
      "INSERT INTO products (name, description, price, stock, category, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, description, price, stock, category, image]
    );
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      stock: row.stock,
      category: row.category,
      image: row.image,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async updateProduct(
    id: number,
    productData: Partial<Omit<Product, "id" | "createdAt">>
  ): Promise<Product | null> {
    const { name, description, price, stock, category, image } = productData;
    const rows = await this.executeQuery(
      "UPDATE products SET name = $1, description = $2, price = $3, stock = $4, category = $5, image = $6, updated_at = NOW() WHERE id = $7 RETURNING *",
      [name, description, price, stock, category, image, id]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      stock: row.stock,
      category: row.category,
      image: row.image,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await this.executeQuery(
      "DELETE FROM products WHERE id = $1",
      [id]
    );
    return result.length > 0;
  }

  async getUniqueProductCategories(): Promise<string[]> {
    const rows = await this.executeQuery(
      "SELECT DISTINCT category FROM products ORDER BY category"
    );
    return rows.map((row: CategoryFromDb) => row.category);
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItemWithProduct[]> {
    const rows = await this.executeQuery(
      `SELECT ci.*, p.name as "productName", p.description as "productDescription", p.price as "productPrice", p.image as "productImage"
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.user_id = $1`,
      [userId]
    );

    return rows.map((row: CartItemFromDb) => ({
      id: row.id,
      user_id: row.user_id,
      product_id: row.product_id,
      quantity: row.quantity,
      product: {
        id: row.product_id,
        name: row.productName,
        description: row.productDescription,
        price: row.productPrice,
        stock: 0, // Not fetched
        category: "", // Not fetched
        image: row.productImage,
        createdAt: "", // Not fetched
        updatedAt: "", // Not fetched
      },
    }));
  }

  async addToCart(data: {
    userId: number;
    productId: number;
    quantity: number;
  }): Promise<CartItem> {
    const { userId, productId, quantity } = data;
    // Check if item already in cart
    const existingItems = await this.executeQuery(
      "SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );

    if (existingItems.length > 0) {
      // Update quantity
      const newQuantity = existingItems[0].quantity + quantity;
      const updated = await this.executeQuery(
        "UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *",
        [newQuantity, existingItems[0].id]
      );
      return updated[0];
    } else {
      // Add new item
      const newItem = await this.executeQuery(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
        [userId, productId, quantity]
      );
      return newItem[0];
    }
  }

  async updateCartItemQuantity(
    cartItemId: number,
    quantity: number
  ): Promise<void> {
    if (quantity > 0) {
      await this.executeQuery(
        "UPDATE cart_items SET quantity = $1 WHERE id = $2",
        [quantity, cartItemId]
      );
    } else {
      await this.removeCartItem(cartItemId);
    }
  }

  async removeCartItem(cartItemId: number): Promise<void> {
    await this.executeQuery("DELETE FROM cart_items WHERE id = $1", [
      cartItemId,
    ]);
  }

  async clearCart(userId: number): Promise<void> {
    await this.executeQuery("DELETE FROM cart_items WHERE user_id = $1", [
      userId,
    ]);
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const totalProducts = await this.executeQuery(
      "SELECT COUNT(*) as count FROM products"
    );
    const totalRevenue = await this.executeQuery(
      "SELECT SUM(total_amount) as sum FROM orders WHERE status = 'completed'"
    );
    const totalOrders = await this.executeQuery(
      "SELECT COUNT(*) as count FROM orders"
    );
    const lowStockItems = await this.executeQuery(
      "SELECT COUNT(*) as count FROM products WHERE stock < 10"
    );

    return {
      totalProducts: parseInt(totalProducts[0].count, 10) || 0,
      totalRevenue: parseFloat(totalRevenue[0].sum) || 0,
      totalOrders: parseInt(totalOrders[0].count, 10) || 0,
      lowStockItems: parseInt(lowStockItems[0].count, 10) || 0,
    };
  }

  async close() {
    await pool.end();
  }
}

export function getDatabase(): Database {
  return Database.getInstance();
}
