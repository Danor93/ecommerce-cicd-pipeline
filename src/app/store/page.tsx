"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Product, CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ShoppingCart, Filter, Package } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { useToast } from "@/lib/toast";
import { useMounted } from "@/hooks/useMounted";

export default function StorePage() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [cartProductIds, setCartProductIds] = useState<Set<number>>(new Set());
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const router = useRouter();
  const { showToast } = useToast();
  const isMounted = useMounted();

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
        setProducts(productsData.data);
        setFilteredProducts(productsData.data);
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
    }
  };

  // Filter and sort products
  useEffect(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

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
      const response = await fetch("/api/cart", {
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

      const data = await response.json();
      if (data.success) {
        showToast(`${productToAdd.name} added to cart!`, "success");
        const newProductId: number = productToAdd.id;
        setCartProductIds((prev: Set<number>) => {
          const newSet = new Set<number>(prev);
          newSet.add(newProductId);
          return newSet;
        });
      } else {
        showToast("Failed to add to cart", "destructive");
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      showToast("Failed to add to cart", "destructive");
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

  if (!isMounted) {
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
        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="flex flex-col hover:shadow-lg transition-shadow relative"
              >
                <CardContent className="p-4 flex flex-col flex-grow pb-24">
                  <div
                    className="cursor-pointer"
                    onClick={() => router.push(`/product/${product.id}`)}
                  >
                    <div className="aspect-square bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-400" />
                    </div>
                    <Badge variant="outline" className="w-fit mb-2">
                      {product.category}
                    </Badge>
                    <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 flex-grow line-clamp-2">
                      {product.description}
                    </p>
                    <p className="mt-4 text-lg font-bold text-gray-900">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/product/${product.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      className="w-full"
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
                        : "Quick Add to Cart"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
