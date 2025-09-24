import React, { useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { clearAuthError, selectAuthError } from "@/features/auth/authSlice";

export default function AlertComponent() {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const lastShownRef = useRef<string | null>(null);

  useEffect(() => {
    if (!error || lastShownRef.current === error) return;
    // Debug log to verify the component detects the error state
    console.log("[AlertComponent] detected error:", error);

    // On web, ensure an alert shows reliably via window.alert fallback
    if (Platform.OS === "web" && typeof window !== "undefined") {
      console.log("[AlertComponent] showing web alert via window.alert");
      window.alert(`Error: ${error}`);
      dispatch(clearAuthError());
      lastShownRef.current = null;
      return;
    }

    console.log("[AlertComponent] showing native alert via Alert.alert");
    Alert.alert("Error", error, [
      {
        text: "OK",
        onPress: () => {
          // Ensure it's cleared after user acknowledges
          dispatch(clearAuthError());
          // Allow the same error text to show again in the future
          lastShownRef.current = null;
        },
      },
    ]);
    lastShownRef.current = error;
  }, [error, dispatch]);

  return null;
}
