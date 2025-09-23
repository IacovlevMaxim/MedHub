import React from "react";
import { useRouter } from "expo-router";
import { useAppSelector } from "@/hooks/useRedux";
import { useEffect } from "react";
import { selectIsAuthenticated } from "@/features/auth/authSlice";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated === false) {
        router.replace("/login");
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return <>{children}</>;
}