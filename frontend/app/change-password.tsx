import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { selectAccessToken } from "@/features/auth/authSlice";
import Feather from "react-native-vector-icons/Feather";

const backendApi = process.env.EXPO_PUBLIC_API_URL;

export default function ChangePassword() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Hide browser's built-in password reveal button on web
  React.useEffect(() => {
    if (Platform.OS === "web") {
      const style = document.createElement("style");
      style.innerHTML = `
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  const validateForm = () => {
    if (oldPassword.length < 6) {
      setError("Current password must be at least 6 characters.");
      return false;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (!accessToken) {
        setError("Not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      // Extract userId from JWT token
      const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
      console.log("Token payload:", tokenPayload);

      // Try multiple possible claim names for userId
      const userId =
        tokenPayload.nameid ||
        tokenPayload.sub ||
        tokenPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] ||
        tokenPayload.userId ||
        tokenPayload.id;

      console.log("Extracted userId:", userId);

      if (!userId) {
        setError("Could not extract user ID from token. Please log in again.");
        setLoading(false);
        return;
      }

      const requestBody = {
        OldPassword: oldPassword,
        NewPassword: newPassword,
      };

      console.log(
        "Sending request to:",
        `${backendApi}/api/User/${userId}/change-password`
      );
      console.log("Request body:", requestBody);

      const response = await fetch(
        `${backendApi}/api/User/${userId}/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const data = await response.text();
        console.log("Error response:", data);
        let errorMessage = "Failed to change password";
        try {
          const jsonData = JSON.parse(data);
          errorMessage = jsonData.message || jsonData.error || errorMessage;
        } catch {
          errorMessage = data || errorMessage;
        }
        setError(errorMessage);
        setLoading(false);
        return;
      }

      setSuccess("Password changed successfully!");
      setLoading(false);

      // Clear form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Navigate back after 2 seconds
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (err) {
      console.error("Catch block error:", err);
      setError(
        `An error occurred: ${err instanceof Error ? err.message : String(err)}`
      );
      setLoading(false);
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
          padding: 24,
        }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#4F8EF7" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Feather name="lock" size={48} color="#4F8EF7" />
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>
            Enter your current password and choose a new one
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry={!showOldPassword}
                placeholder="Enter current password"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowOldPassword(!showOldPassword)}
                style={styles.eyeIcon}
              >
                <Feather
                  name={showOldPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeIcon}
              >
                <Feather
                  name={showNewPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Feather
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Changing..." : "Change Password"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  backButton: {
    flexDirection: "row" as "row",
    alignItems: "center" as "center",
    marginBottom: 24,
  },
  backText: {
    fontSize: 16,
    color: "#4F8EF7",
    marginLeft: 8,
    fontWeight: "500" as "500",
  },
  header: {
    alignItems: "center" as "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold" as "bold",
    color: "#222",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center" as "center",
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center" as "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as "600",
    color: "#333",
    marginBottom: 8,
  },
  passwordInput: {
    flexDirection: "row" as "row",
    alignItems: "center" as "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#222",
  },
  eyeIcon: {
    paddingHorizontal: 16,
  },
  errorText: {
    color: "#E53935",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  successText: {
    color: "#4CAF50",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
    fontWeight: "500" as "500",
  },
  submitButton: {
    backgroundColor: "#4F8EF7",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center" as "center",
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as "600",
  },
});
