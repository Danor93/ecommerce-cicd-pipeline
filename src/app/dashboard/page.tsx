"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingBag,
  TrendingUp,
  Package,
  AlertTriangle,
  DollarSign,
  MoreHorizontal,
  LogOut,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { Product, DashboardStats, User } from "@/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load stats
      const statsResponse = await fetch("/api/dashboard");
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Load products
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { variant: "destructive" as const, text: "Out of Stock" };
    if (stock < 10) return { variant: "secondary" as const, text: "Low Stock" };
    return { variant: "default" as const, text: "In Stock" };
  };

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
    });
    setFormErrors({});
    setSubmitError("");
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Required field validation
    if (!productForm.name.trim()) {
      errors.name = "Product name is required";
    } else if (productForm.name.trim().length < 2) {
      errors.name = "Product name must be at least 2 characters";
    }

    if (!productForm.description.trim()) {
      errors.description = "Description is required";
    } else if (productForm.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    if (!productForm.category.trim()) {
      errors.category = "Category is required";
    }

    // Price validation
    if (!productForm.price.trim()) {
      errors.price = "Price is required";
    } else {
      const price = parseFloat(productForm.price);
      if (isNaN(price)) {
        errors.price = "Price must be a valid number";
      } else if (price <= 0) {
        errors.price = "Price must be greater than 0";
      } else if (price > 999999) {
        errors.price = "Price cannot exceed $999,999";
      }
    }

    // Stock validation
    if (!productForm.stock.trim()) {
      errors.stock = "Stock quantity is required";
    } else {
      const stock = parseInt(productForm.stock);
      if (isNaN(stock)) {
        errors.stock = "Stock must be a valid number";
      } else if (stock < 0) {
        errors.stock = "Stock cannot be negative";
      } else if (stock > 99999) {
        errors.stock = "Stock cannot exceed 99,999";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddProduct = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
    });
    setShowEditDialog(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const submitAddProduct = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: productForm.name.trim(),
          description: productForm.description.trim(),
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock),
          category: productForm.category.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowAddDialog(false);
        resetForm();
        loadDashboardData(); // Refresh the data
      } else {
        setSubmitError(data.error || "Failed to create product");
      }
    } catch (error) {
      setSubmitError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEditProduct = async () => {
    if (!selectedProduct) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: productForm.name.trim(),
          description: productForm.description.trim(),
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock),
          category: productForm.category.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowEditDialog(false);
        setSelectedProduct(null);
        resetForm();
        loadDashboardData(); // Refresh the data
      } else {
        setSubmitError(data.error || "Failed to update product");
      }
    } catch (error) {
      setSubmitError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setShowDeleteDialog(false);
        setSelectedProduct(null);
        loadDashboardData(); // Refresh the data
      } else {
        alert(data.error || "Failed to delete product");
      }
    } catch (error) {
      alert("Failed to delete product");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                E-Commerce Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Active products in inventory
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Low Stock Alert
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Items with stock &lt; 10
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Products</CardTitle>
                <CardDescription>Manage your product inventory</CardDescription>
              </div>
              <Button onClick={handleAddProduct}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.text}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteProduct(product)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product for your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                className={formErrors.name ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value,
                  })
                }
                className={formErrors.description ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {formErrors.description && (
                <p className="text-sm text-red-500">{formErrors.description}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
                className={formErrors.price ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {formErrors.price && (
                <p className="text-sm text-red-500">{formErrors.price}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={productForm.stock}
                onChange={(e) =>
                  setProductForm({ ...productForm, stock: e.target.value })
                }
                className={formErrors.stock ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {formErrors.stock && (
                <p className="text-sm text-red-500">{formErrors.stock}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={productForm.category}
                onChange={(e) =>
                  setProductForm({ ...productForm, category: e.target.value })
                }
                className={formErrors.category ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {formErrors.category && (
                <p className="text-sm text-red-500">{formErrors.category}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={submitAddProduct} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                className={formErrors.name ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Input
                id="edit-description"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value,
                  })
                }
                className={formErrors.description ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {formErrors.description && (
                <p className="text-sm text-red-500">{formErrors.description}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-price">Price ($) *</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0.01"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
                className={formErrors.price ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {formErrors.price && (
                <p className="text-sm text-red-500">{formErrors.price}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-stock">Stock Quantity *</Label>
              <Input
                id="edit-stock"
                type="number"
                min="0"
                value={productForm.stock}
                onChange={(e) =>
                  setProductForm({ ...productForm, stock: e.target.value })
                }
                className={formErrors.stock ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {formErrors.stock && (
                <p className="text-sm text-red-500">{formErrors.stock}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Input
                id="edit-category"
                value={productForm.category}
                onChange={(e) =>
                  setProductForm({ ...productForm, category: e.target.value })
                }
                className={formErrors.category ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {formErrors.category && (
                <p className="text-sm text-red-500">{formErrors.category}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={submitEditProduct} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProduct}>
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
