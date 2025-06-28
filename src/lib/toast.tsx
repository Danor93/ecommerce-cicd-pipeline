"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast } from "@/components/ui/toast";

interface ToastMessage {
  id: string;
  message: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

interface ToastContextType {
  showToast: (
    message: string,
    variant?: "default" | "destructive" | "success",
    duration?: number
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (
      message: string,
      variant: "default" | "destructive" | "success" = "default",
      duration = 3000
    ) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toast: ToastMessage = { id, message, variant, duration };

      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            onClose={() => removeToast(toast.id)}
          >
            {toast.message}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
