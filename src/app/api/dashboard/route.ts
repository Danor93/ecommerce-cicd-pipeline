import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";

export async function GET() {
  try {
    const db = getDatabase();
    const stats = await db.getDashboardStats();

    return NextResponse.json({
      success: true,
      data: stats,
      message: "Dashboard stats retrieved successfully",
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
