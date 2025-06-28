import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { LoginCredentials } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const user = await db.validateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // In a real app, you would create a JWT token here
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        // Mock token - in real app use proper JWT
        token: "mock-jwt-token-" + user.id,
      },
      message: "Login successful",
    });
  } catch (_error) {
    console.error("[LOGIN_POST]", _error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
