"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, CartItemWithProduct } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingCart } from "lucide-react";

export default function CartPage() {
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    loadCartItems(parsedUser.id);
  }, [router]);

  const loadCartItems = async (userId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cart", {
        headers: { "x-user-id": userId.toString() },
      });
      const data = await response.json();
      if (data.success) {
        setCartItems(data.data);
      }
    } catch (error) {
      console.error("Failed to load cart items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return; // Or handle removal
    try {
      await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user!.id.toString(),
        },
        body: JSON.stringify({ cartItemId, quantity }),
      });
      loadCartItems(user!.id); // Refresh cart
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user!.id.toString(),
        },
        body: JSON.stringify({ cartItemId }),
      });
      loadCartItems(user!.id); // Refresh cart
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Your Shopping Cart
          </h1>
          <Button variant="outline" onClick={() => router.push("/store")}>
            Continue Shopping
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-900">
              Your cart is empty
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Looks like you haven't added anything to your cart yet.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg">
            <ul role="list" className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item.id} className="flex py-6 px-4 sm:px-6">
                  <div className="flex-shrink-0">
                    {/* Placeholder for image */}
                    <div className="bg-gray-200 rounded-md w-24 h-24"></div>
                  </div>

                  <div className="ml-6 flex-1 flex flex-col">
                    <div className="flex">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-gray-800">
                          {item.product.name}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatCurrency(item.product.price)}
                        </p>
                      </div>

                      <div className="ml-4 flex-shrink-0 flow-root">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-5 w-5 text-gray-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 pt-2 flex items-end justify-between">
                      <div className="flex items-center">
                        <label
                          htmlFor={`quantity-${item.id}`}
                          className="sr-only"
                        >
                          Quantity
                        </label>
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseInt(e.target.value)
                            )
                          }
                          className="w-20"
                        />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>{formatCurrency(cartTotal)}</p>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="mt-6">
                <Button className="w-full">Checkout</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
