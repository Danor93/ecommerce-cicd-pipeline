"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Product, CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import AppHeader from "@/components/AppHeader";

export default function StorePage() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [cartProductIds, setCartProductIds] = useState<Set<number>>(new Set());
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    loadStoreData(parsedUser.id);
  }, [router]);

  const loadStoreData = async (userId: number) => {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes, cartRes] = await Promise.all([
        fetch("/api/store/products"),
        fetch("/api/store/categories"),
        fetch("/api/cart", { headers: { "x-user-id": userId.toString() } }),
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const cartData = await cartRes.json();

      if (productsData.success) {
        const sortedProducts = productsData.data.sort(
          (a: Product, b: Product) => a.category.localeCompare(b.category)
        );
        setProducts(sortedProducts);
      }
      if (categoriesData.success) setCategories(categoriesData.data);
      if (cartData.success) {
        const productIdsInCart = new Set(
          cartData.data.map((item: CartItem) => item.product_id)
        );
        setCartProductIds(productIdsInCart as Set<number>);
      }
    } catch (error) {
      console.error("Failed to load store data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCartClick = (product: Product) => {
    setSelectedProduct(product);
    setQuantityToAdd(1); // Reset to 1 each time
    setIsQuantityDialogOpen(true);
  };

  const submitAddToCart = async () => {
    if (!user || !selectedProduct || quantityToAdd < 1) {
      return;
    }
    const productToAdd: Product = selectedProduct;
    setAddingProductId(productToAdd.id);
    setIsQuantityDialogOpen(false);
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id.toString(),
        },
        body: JSON.stringify({
          productId: productToAdd.id,
          quantity: quantityToAdd,
        }),
      });

      const newProductId: number = productToAdd.id;
      setCartProductIds((prev: Set<number>) => {
        const newSet = new Set<number>(prev);
        newSet.add(newProductId);
        return newSet;
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingProductId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader title="Store">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/cart")}
        >
          <ShoppingCart className="h-6 w-6" />
        </Button>
      </AppHeader>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <CardContent className="p-4 flex flex-col flex-grow">
                <Badge variant="outline" className="w-fit mb-2">
                  {product.category}
                </Badge>
                <h3 className="text-lg font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600 flex-grow">
                  {product.description}
                </p>
                <p className="mt-4 text-lg font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </p>
                <Button
                  className="w-full mt-4"
                  onClick={() => handleAddToCartClick(product)}
                  disabled={
                    addingProductId === product.id ||
                    cartProductIds.has(product.id)
                  }
                >
                  {cartProductIds.has(product.id)
                    ? "Added to Cart"
                    : addingProductId === product.id
                    ? "Adding..."
                    : "Add to Cart"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Dialog
        open={isQuantityDialogOpen}
        onOpenChange={setIsQuantityDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Enter Quantity for {selectedProduct?.name}
            </DialogTitle>
            <DialogDescription>
              Please specify how many units you would like to add to your cart.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantityToAdd}
              onChange={(e) => setQuantityToAdd(Number(e.target.value))}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsQuantityDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={submitAddToCart}>Add to Cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
