"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingBag, BarChart, Package, Users } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem("user");
    if (userData) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-4">
              <ShoppingBag className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            E-Commerce Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Manage your online store with our comprehensive dashboard. Track
            sales, manage inventory, and grow your business.
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="text-lg px-8 py-4"
          >
            Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <BarChart className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle>Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get detailed insights into your sales performance and customer
                behavior with comprehensive analytics.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Package className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Keep track of your products, monitor stock levels, and receive
                alerts when inventory runs low.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Users className="h-10 w-10 text-purple-600" />
              </div>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage user accounts, roles, and permissions with our secure
                authentication system.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Demo credentials: admin@example.com / admin123
          </p>
          <Button size="lg" onClick={handleGetStarted}>
            Access Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
