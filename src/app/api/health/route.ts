import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
}
