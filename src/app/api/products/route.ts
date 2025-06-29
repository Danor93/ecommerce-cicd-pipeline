import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";

export async function GET() {
  try {
    const db = getDatabase();
    const products = await db.getAllProducts();

    return NextResponse.json({
      success: true,
      data: products,
      message: "Products retrieved successfully",
    });
  } catch (_error) {
    console.error("[PRODUCTS_GET]", _error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, stock, category } = body;

    if (!name || !description || !price || stock === undefined || !category) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    if (price <= 0 || stock < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Price must be positive and stock cannot be negative",
        },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const product = await db.createProduct({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
    });

    return NextResponse.json(
      {
        success: true,
        data: product,
        message: "Product created successfully",
      },
      { status: 201 }
    );
  } catch (_error) {
    console.error("[PRODUCTS_POST]", _error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}
