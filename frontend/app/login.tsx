import InputField from "@/components/InputField";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { loginAsync, selectAuthStatus, setAuthenticated, initializeAuthAsync } from "@/features/auth/authSlice";

import useInputField from "@/hooks/useInputField";
import { Link, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import React from "react";
import Svg, { Path } from 'react-native-svg';

// Accept either a valid email OR a username (non-empty, min 3 chars)
const identifierValidation = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "This field is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (trimmed.includes("@")) {
    return emailRegex.test(trimmed) ? undefined : "Enter a valid email address.";
  }
  // Username path: basic length check
  if (trimmed.length < 3) return "Username must be at least 3 characters.";
  return undefined;
};

const passwordValidation = (value: string) => {
  if (value.length < 6) return "Password must be at least 6 characters.";
  return undefined;
};

export default function Login() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const status = useAppSelector(selectAuthStatus);
  const emailField = useInputField({
    label: "Email or Username",
    field: "email",
    value: "",
    validationFn: identifierValidation,
  });
  const passwordField = useInputField({
    label: "Password",
    field: "password",
    value: "",
    secureTextEntry: true,
    validationFn: passwordValidation,
  });

  React.useEffect(() => {
    const checkStoredTokens = async () => {
      try {
        const resultAction = await dispatch(initializeAuthAsync());
        if (initializeAuthAsync.fulfilled.match(resultAction)) {
          console.log("Tokens found, user is logged in");
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.log("No tokens found, user needs to log in");
      }
    };

    checkStoredTokens();
  }, [dispatch, router]);

  const validateForm = () => {
    console.log("Validating form...");
    const fields = [emailField, passwordField];
    for (const field of fields) {
      if (field.validationFn) {
        const error = field.validationFn(field.value);
        console.log("error", error);
        if (error) return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const resultAction = await dispatch(
          loginAsync({
            identifier: emailField.value,
            password: passwordField.value,
          })
        );
        if (loginAsync.fulfilled.match(resultAction)) {
          console.log("Login successful");
          // Login successful, navigation handled elsewhere
          router.replace("/(tabs)");
        } else {
          // Rejected: global AlertComponent will show message from slice
        }
      } catch {
        // Global AlertComponent will handle any error from slice
      }
    }
  };

  const handleRegister = () => {};
  const handleForgotPassword = () => {};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={styles.inner}>
          <View style={styles.logoBox}>
            <View style={styles.logoCircle}>
              <Svg width="40" height="40" viewBox="0 0 131 181" fill="none">
                <Path 
                  d="M125.1 56.7H104.5C78.1001 56.7 56.6001 78.1 56.6001 104.6C56.6001 108.4 52.8001 111 49.3001 109.7C43.0001 107.3 37.1001 103.6 32.2001 98.6C23.3001 89.6 18.5001 77.6 18.7001 65C19.1001 40.1 39.6001 19.4 64.5001 18.8C76.1001 18.5 87.1001 22.4 95.8001 29.8C97.9001 31.6 101.1 31.6 103.1 29.6L108.3 24.6C110.6 22.4 110.5 18.6 108 16.5C95.9001 6.1 80.2001 0.399995 64.1001 0.799995C47.3001 1.2 31.5001 8 19.6001 20C7.70008 32.1 1.00009 47.9 0.700086 64.7C0.400086 82.2 7.10009 98.7 19.4001 111.2C29.6001 121.5 42.6001 128 56.6001 130V130.6V175.1C56.6001 178.1 59.0001 180.5 62.0001 180.5H69.1001C72.1001 180.5 74.5001 178.1 74.5001 175.1V134.5C74.5001 131.9 76.3001 129.7 78.8001 129.2C108.2 123.1 130.4 96.9 130.4 65.7V62.1C130.5 59.1 128.1 56.7 125.1 56.7Z" 
                  fill="#FFFFFF"
                />
              </Svg>
            </View>
            <Text style={styles.title}>MedHub</Text>
            <Text style={styles.subtitle}>
              Access your medical records and appointments
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <View style={styles.form}>
              <InputField
                label="Email or Username"
                value={emailField.value}
                setValue={emailField.setValue}
                error={emailField.error}
              />
              <InputField
                label="Password"
                value={passwordField.value}
                setValue={passwordField.setValue}
                error={passwordField.error}
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleSubmit}
                disabled={status === "loading"}
              >
                <Text style={styles.signInButtonText}>
                  {status === "loading" ? "Signing In..." : "Sign In"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actions}>
              <Link href="/register" asChild>
                <TouchableOpacity
                  style={styles.outlineButton}
                  onPress={handleRegister}
                >
                  <Text style={styles.outlineButtonText}>
                    Create New Account
                  </Text>
                </TouchableOpacity>
              </Link>
              <Link href="/reset" asChild>
                <TouchableOpacity
                  style={styles.ghostButton}
                  onPress={handleForgotPassword}
                >
                  <Text style={styles.ghostButtonText}>Forgot Password?</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          <Text style={styles.terms}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  inner: {
    width: "100%",
    maxWidth: 400,
  },
  logoBox: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    backgroundColor: "#4F8EF7",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  subtitle: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#222",
  },
  form: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#222",
    marginBottom: 4,
    fontWeight: "500",
  },
  input: {
    height: 44,
    backgroundColor: "#F5F6FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e3e8f0",
    paddingHorizontal: 12,
    fontSize: 16,
  },
  signInButton: {
    backgroundColor: "#4F8EF7",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  signInButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  actions: {
    marginTop: 16,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#e3e8f0",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  outlineButtonText: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 16,
  },
  ghostButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  ghostButtonText: {
    color: "#4F8EF7",
    fontWeight: "bold",
    fontSize: 16,
  },
  terms: {
    textAlign: "center",
    color: "#888",
    fontSize: 13,
    marginTop: 16,
  },
});
