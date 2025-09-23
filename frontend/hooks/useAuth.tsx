import React, { useRouter } from "expo-router";
import { useAppSelector } from "@/hooks/useRedux";
import { useEffect, useState } from "react";
import { selectIsAuthenticated } from "@/features/auth/authSlice";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [hasAttemptedRedirect, setHasAttemptedRedirect] = useState(false);

  useEffect(() => {
    // Only attempt redirect if we haven't already AND authentication state is definitively false
    if (!hasAttemptedRedirect && isAuthenticated === false) {
      const timer = setTimeout(() => {
        console.log("Redirecting to login due to unauthenticated state");
        router.replace("/login");
        setHasAttemptedRedirect(true);
      }, 1500); // Slightly longer delay for router stability

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, hasAttemptedRedirect, router]);

  // Reset redirect flag if auth state changes to true
  useEffect(() => {
    if (isAuthenticated === true) {
      setHasAttemptedRedirect(false);
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}