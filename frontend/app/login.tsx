import InputField from "@/components/InputField";
import { useAuth } from "@/hooks/useAuth";
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
  TextInput,
  ScrollView,
} from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";
import Icon from "react-native-vector-icons/FontAwesome5";

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
  const auth = useAuth();
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
      const res = await auth?.authFetch("/api/Auth/login", {
        fetchParams: {
          method: "POST",
          body: JSON.stringify({
            identifier: emailField.value,
            password: passwordField.value,
          }),
        },
      });
      if (res.status === 200) {
        auth?.signIn();
      } else {
        Alert.alert("Error", "Invalid email or password.");
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
              <Text style={styles.logoText}>
                <Icon name="briefcase-medical" color="red" size={40} />
              </Text>
            </View>
            <Text style={styles.title}>MedHub</Text>
            <Text style={styles.subtitle}>
              Access your medical records and appointments
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email or Username</Text>
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
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={passwordField.value}
                  onChangeText={passwordField.setValue}
                  secureTextEntry
                />
              </View>
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleSubmit}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
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
