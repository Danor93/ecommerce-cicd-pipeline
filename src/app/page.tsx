"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  BarChart,
  Package,
  Users,
  Star,
  Truck,
  Shield,
  Headphones,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/types";
import AnimatedText from "@/components/ui/AnimatedText";
import HoverAnimatedText from "@/components/ui/HoverAnimatedText";
import {
  pageWrapperProps,
  heroVariants,
  staggerContainer,
  fadeInUp,
  scaleIn,
  buttonHover,
  counterVariants,
  iconHover,
} from "@/lib/animations";

export default function HomePage() {
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem("user");
    if (userData) {
      router.push("/dashboard");
    } else {
      setIsCheckingAuth(false);
      loadFeaturedProducts();
    }
  }, [router]);

  const loadFeaturedProducts = async () => {
    try {
      const response = await fetch("/api/store/products");
      const data = await response.json();
      if (data.success) {
        // Get first 3 products as featured
        setFeaturedProducts(data.data.slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to load featured products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStarted = () => {
    router.push("/login");
  };

  const handleViewStore = () => {
    router.push("/login");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Business Owner",
      content:
        "This platform has revolutionized how we manage our inventory and track sales. The analytics are incredibly detailed.",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Store Manager",
      content:
        "Easy to use interface and powerful features. Our team was up and running in no time.",
      rating: 5,
    },
    {
      name: "Emily Davis",
      role: "E-commerce Director",
      content:
        "The best e-commerce management solution we've used. Highly recommend for growing businesses.",
      rating: 5,
    },
  ];

  const features = [
    {
      icon: BarChart,
      title: "Advanced Analytics",
      description:
        "Get detailed insights into your sales performance and customer behavior with comprehensive analytics and reporting.",
    },
    {
      icon: Package,
      title: "Inventory Management",
      description:
        "Keep track of your products, monitor stock levels, and receive alerts when inventory runs low.",
    },
    {
      icon: Users,
      title: "User Management",
      description:
        "Manage user accounts, roles, and permissions with our secure authentication system.",
    },
    {
      icon: Truck,
      title: "Order Management",
      description:
        "Streamline your order processing from cart to delivery with automated workflows.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description:
        "Enterprise-grade security with 99.9% uptime guarantee for your peace of mind.",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description:
        "Get help when you need it with our dedicated customer support team available around the clock.",
    },
  ];

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <motion.div
      {...pageWrapperProps}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800"
    >
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={heroVariants}
          initial="initial"
          animate="animate"
          className="text-center mb-16"
        >
          <motion.div variants={scaleIn} className="flex justify-center mb-6">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-4">
              <ShoppingBag className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </motion.div>
          <AnimatedText
            text="Professional E-Commerce Management Platform"
            el="h1"
            className="text-5xl font-bold text-gray-900 dark:text-white mb-4"
          />
          <AnimatedText
            text="Streamline your online business with our comprehensive dashboard. Track sales, manage inventory, analyze performance, and grow your business with powerful tools designed for modern e-commerce."
            el="p"
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          />
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div {...buttonHover}>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="text-lg px-8 py-4"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div {...buttonHover}>
              <Button
                size="lg"
                variant="outline"
                onClick={handleViewStore}
                className="text-lg px-8 py-4"
              >
                View Demo Store
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16"
        >
          <motion.div variants={counterVariants} className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">10k+</div>
            <div className="text-gray-600">Active Users</div>
          </motion.div>
          <motion.div variants={counterVariants} className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">$50M+</div>
            <div className="text-gray-600">Revenue Processed</div>
          </motion.div>
          <motion.div variants={counterVariants} className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
            <div className="text-gray-600">Uptime</div>
          </motion.div>
          <motion.div variants={counterVariants} className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-600">Support</div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Everything You Need to Succeed
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <motion.div
                      {...iconHover}
                      className="flex justify-center mb-4"
                    >
                      <feature.icon className="h-10 w-10 text-blue-600" />
                    </motion.div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Featured Products */}
        {!isLoading && featuredProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-400" />
                    </div>
                    <Badge variant="outline" className="mb-2">
                      {product.category}
                    </Badge>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(product.price)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button onClick={handleViewStore} variant="outline" size="lg">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            What Our Customers Say
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center h-full">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      {Array.from({ length: testimonial.rating }).map(
                        (_, i) => (
                          <motion.div {...iconHover} key={i}>
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          </motion.div>
                        )
                      )}
                    </div>
                    <p className="text-gray-600 mb-4 italic">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900">
                        <HoverAnimatedText text={testimonial.name} el="span" />
                      </p>
                      <p className="text-sm text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Join thousands of businesses already using our platform to grow
            their online presence.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            <strong>Demo credentials:</strong> admin@example.com / admin123
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="text-lg px-8 py-4"
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/about")}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
