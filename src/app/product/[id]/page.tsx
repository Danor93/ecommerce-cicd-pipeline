"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { User, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingCart, Package, Truck } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { useToast } from "@/lib/toast";

export default function ProductDetailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    loadProduct();
  }, [router, params.id]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
        // Load related products from same category
        loadRelatedProducts(data.data.category);
      } else {
        showToast("Product not found", "destructive");
        router.push("/store");
      }
    } catch (error) {
      console.error("Failed to load product:", error);
      showToast("Failed to load product", "destructive");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelatedProducts = async (category: string) => {
    try {
      const response = await fetch("/api/store/products");
      const data = await response.json();
      if (data.success) {
        const filtered = data.data
          .filter(
            (p: Product) =>
              p.category === category && p.id !== parseInt(params.id as string)
          )
          .slice(0, 4);
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error("Failed to load related products:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!user || !product) return;

    setIsAddingToCart(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id.toString(),
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      const data = await response.json();
      if (data.success) {
        showToast(`${product.name} added to cart!`, "success");
      } else {
        showToast("Failed to add to cart", "destructive");
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      showToast("Failed to add to cart", "destructive");
    } finally {
      setIsAddingToCart(false);
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
      <div className="min-h-screen bg-gray-50">
        <AppHeader title="Product Details" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader title="Product Not Found" />
        <div className="text-center py-12">
          <p className="text-gray-500">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="Product Details">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/cart")}
        >
          <ShoppingCart className="h-6 w-6" />
        </Button>
      </AppHeader>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Store
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <Package className="h-24 w-24 text-gray-400" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 rounded-md flex items-center justify-center"
                >
                  <Package className="h-8 w-8 text-gray-300" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(product.price)}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Package className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Truck className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Free shipping on orders over $50
              </span>
            </div>

            <Separator />

            {/* Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="quantity">Quantity:</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-20"
                />
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock === 0}
                className="w-full"
                size="lg"
              >
                {isAddingToCart ? (
                  "Adding to Cart..."
                ) : product.stock === 0 ? (
                  "Out of Stock"
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/product/${relatedProduct.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                    <Badge variant="outline" className="mb-2">
                      {relatedProduct.category}
                    </Badge>
                    <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(relatedProduct.price)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
