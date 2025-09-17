import { useAuth } from "@/hooks/useAuth";
import useInputField from "@/hooks/useInputField";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
} from "react-native";
import { Colors } from "@/constants/Colors";
import Icon from "react-native-vector-icons/FontAwesome5";

const emailValidation = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "Enter a valid email address.";
  return undefined;
};

export default function Reset() {
  const router = useRouter();
  const [sentLink, setSentLink] = useState(false);
  const auth = useAuth();
  const emailField = useInputField({
    label: "Email",
    field: "email",
    value: "",
    validationFn: emailValidation,
  });

  const validateForm = () => {
    const fields = [emailField];
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
      // In a real app, you would authenticate with a server here
      const res = await auth?.authFetch("/api/Auth/forgot-password", {
        fetchParams: {
          method: "POST",
          body: JSON.stringify({
            email: emailField.value,
          }),
        },
      });

      if (res.status === 200) {
        setSentLink(true);
        router.push("/new-password");
      } else {
        Alert.alert("Error", "There is no account with this email.");
      }

      //   auth?.signIn();
      // Navigation is handled by the AuthProvider in _layout.tsx
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
                <Icon name="unlock-alt" color="#fff" size={28} />
              </Text>
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              You will receive a link to reset your password at the email
              address provided.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Send reset link</Text>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={emailField.value}
                  onChangeText={emailField.setValue}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {sentLink && (
                <Text style={{ color: "#4BB543", textAlign: "center" }}>
                  Reset link sent! Please check your email.
                </Text>
              )}

              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.signInButtonText}>Send Reset Link</Text>
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
