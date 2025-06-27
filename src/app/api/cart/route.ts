import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { User } from "@/types";

// A helper to get user from a session/token
// For now, we'll simulate it, in a real app, this would involve token verification
async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  // In a real app, you'd verify a JWT or session cookie
  // For this example, we'll assume a user ID is passed in headers
  const userId = request.headers.get("x-user-id");
  if (!userId) return null;

  const db = getDatabase();
  const user = await db.findUserByEmail("user@example.com"); // Placeholder
  // This is insecure, just for demonstration.
  // In a real app you would look up the user by the ID from the token
  return { ...user, id: parseInt(userId) } as User;
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const db = getDatabase();
    const cartItems = await db.getCartItems(user.id);
    return NextResponse.json({ success: true, data: cartItems });
  } catch (error) {
    console.error("Failed to get cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { productId, quantity } = await request.json();
    if (!productId || !quantity) {
      return NextResponse.json(
        { success: false, error: "Product ID and quantity are required" },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const cartItem = await db.addToCart({
      userId: user.id,
      productId,
      quantity,
    });
    return NextResponse.json({ success: true, data: cartItem });
  } catch (error) {
    console.error("Failed to add to cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { cartItemId, quantity } = await request.json();
    if (!cartItemId || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: "Cart Item ID and quantity are required" },
        { status: 400 }
      );
    }

    const db = getDatabase();
    await db.updateCartItemQuantity(cartItemId, quantity);
    return NextResponse.json({ success: true, message: "Cart updated" });
  } catch (error) {
    console.error("Failed to update cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { cartItemId } = await request.json();
    if (!cartItemId) {
      return NextResponse.json(
        { success: false, error: "Cart Item ID is required" },
        { status: 400 }
      );
    }

    const db = getDatabase();
    await db.removeCartItem(cartItemId);
    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Failed to remove from cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
