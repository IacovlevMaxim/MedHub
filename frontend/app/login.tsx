import InputField from "@/components/InputField";
import useInputField from "@/hooks/useInputField";
import { Link } from "expo-router";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { loginAsync, selectAuthStatus, setAuthenticated } from "@/features/auth/authSlice";

import React from "react";
import { Colors } from "@/constants/Colors";
const emailValidation = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "Enter a valid email address.";
  return undefined;
};

const passwordValidation = (value: string) => {
  if (value.length < 6) return "Password must be at least 6 characters.";
  return undefined;
};

export default function Login() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);

  const emailField = useInputField({
    label: "Email",
    field: "email",
    value: "",
    validationFn: emailValidation,
  });
  const passwordField = useInputField({
    label: "Password",
    field: "password",
    value: "",
    secureTextEntry: true,
    validationFn: passwordValidation,
  });

  const validateForm = () => {
    const fields = [emailField, passwordField];
    for (const field of fields) {
      if (field.validationFn) {
        const error = field.validationFn(field.value);
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
          // Login successful, navigation handled elsewhere
          dispatch(setAuthenticated(true));
        } else {
          Alert.alert("Error", "Invalid email or password.");
        }
      } catch {
        Alert.alert("Error", "Login failed.");
      }
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <InputField {...emailField} />

        <InputField {...passwordField} />

        <Link href="/register" style={styles.link}>
          <Text>Register</Text>
        </Link>

        <Link href="/reset" style={styles.link}>
          <Text>Forgot Password</Text>
        </Link>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  link: {
    color: Colors.light.text,
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: Colors.light.text,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: "bold",
  },
});
