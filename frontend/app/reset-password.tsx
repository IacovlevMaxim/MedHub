import React, { useState } from "react";
import useInputField from "@/hooks/useInputField";
import InputField from "@/components/InputField";
import { router, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome5";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import ErrorBanner from "@/components/ErrorBanner";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { resetPasswordAsync, selectAuthStatus, selectAuthError } from "@/features/auth/authSlice";

const passwordValidation = (value: string) => {
  if (value.length < 6) return "Password must be at least 6 characters.";
  return undefined;
};

export default function Reset() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const { email, token } = useLocalSearchParams<{ email: string; token: string }>();
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const passwordField = useInputField({
    label: "Password",
    field: "password",
    value: "",
    secureTextEntry: true,
    validationFn: passwordValidation,
  });

  const confirmPasswordField = useInputField({
    label: "Confirm Password",
    field: "confirmPassword",
    value: "",
    secureTextEntry: true,
    validationFn: passwordValidation,
  });

  const validateForm = () => {
    setPasswordMismatch(false);
    const fields = [passwordField, confirmPasswordField];
    for (const field of fields) {
      if (field.validationFn) {
        const error = field.validationFn(field.value);
        if (error) return false;
      }
    }

    if (passwordField.value !== confirmPasswordField.value) {
      setPasswordMismatch(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setSuccess(false);
    if (!validateForm()) return;

    if (!email || !token) {
      Alert.alert('Error', 'Invalid reset link. Please request a new password reset.');
      return;
    }

    try {
      const resultAction = await dispatch(
        resetPasswordAsync({
          email,
          token,
          newPassword: passwordField.value,
        })
      );

      if (resetPasswordAsync.fulfilled.match(resultAction)) {
        Alert.alert(
          'Reset Successful',
          'Please login with your new password.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login'),
            },
          ]
        );
        setSuccess(true)
      } else {
        Alert.alert('Failed to reset password', 'The link may be invalid or expired.');
      }
    } catch (err) {
      Alert.alert('An unexpected error occurred', 'Please try again.');
    }
  };

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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <View style={styles.logoBox}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>
                <Icon name="lock" color="#fff" size={28} />
              </Text>
            </View>
            <Text style={styles.title}>Set a new password</Text>
            <Text style={styles.subtitle}>
              Choose a strong password and confirm it below
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>New password</Text>
            
            {passwordMismatch && (
              <ErrorBanner message="Passwords do not match" />
            )}
            
            {error && (
              <ErrorBanner message={error} />
            )}
            
            <View style={styles.form}>
              <InputField
                label="Password"
                value={passwordField.value}
                setValue={passwordField.setValue}
                error={passwordField.error}
                secureTextEntry
              />
              <InputField
                label="Confirm Password"
                value={confirmPasswordField.value}
                setValue={confirmPasswordField.setValue}
                error={confirmPasswordField.error}
                secureTextEntry
              />

              {success && (
                <Text style={{ color: "#4BB543", textAlign: "center" }}>
                  Password reset successfully!
                </Text>
              )}

              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.signInButtonText}>Set Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
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
    textAlign: "center",
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
});
