"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LogOut, LayoutDashboard, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import { useMounted } from "@/hooks/useMounted";
import { useToast } from "@/lib/toast";

interface AppHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default function AppHeader({ title, children }: AppHeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const isMounted = useMounted();
  const { showToast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    showToast("You have been successfully logged out.", "default");
    router.push("/login");
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <motion.h1
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-3xl font-bold text-gray-900"
          >
            {title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center space-x-4"
          >
            {children}

            {isMounted && (
              <>
                {/* Mobile Menu */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="sm:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col space-y-4 mt-6">
                      <Button
                        variant="ghost"
                        onClick={() => router.push("/about")}
                        className="justify-start"
                      >
                        About Us
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => router.push("/contact")}
                        className="justify-start"
                      >
                        Contact
                      </Button>
                      {user?.role === "admin" && (
                        <Button
                          variant="outline"
                          onClick={() => router.push("/admin-panel")}
                          className="justify-start"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Button>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Desktop Menu */}
                <Button
                  variant="ghost"
                  onClick={() => router.push("/about")}
                  className="hidden sm:inline-flex"
                >
                  About
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/contact")}
                  className="hidden sm:inline-flex"
                >
                  Contact
                </Button>
                {user?.role === "admin" && (
                  <Button
                    variant="outline"
                    onClick={() => router.push("/admin-panel")}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Button>
                )}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{user.name}</p>
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
