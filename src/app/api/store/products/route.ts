import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";

export async function GET() {
  try {
    const db = getDatabase();
    const products = await db.getAllProducts();
    // Return only products that are in stock
    const availableProducts = products.filter((p) => p.stock > 0);
    return NextResponse.json({
      success: true,
      data: availableProducts,
    });
  } catch (error) {
    console.error("Failed to fetch store products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
