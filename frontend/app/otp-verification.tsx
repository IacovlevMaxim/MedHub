import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  verifyOtpAsync,
  configure2FAAsync,
  loginAsync,
  selectAuthStatus,
} from "@/features/auth/authSlice";
import * as SecureStore from "expo-secure-store";

export default function OtpVerification() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useLocalSearchParams();
  const status = useAppSelector(selectAuthStatus);

  // Get 2FA setup flag from params (this is safe)
  const { is2FASetup, enable } = params as {
    is2FASetup?: string;
    enable?: string;
  };

  const is2FASetupMode = is2FASetup === "true";
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Load credentials from secure storage on mount
  useEffect(() => {
    const loadCredentials = async () => {
      if (!is2FASetupMode) {
        // Only load credentials for login OTP, not 2FA setup
        if (Platform.OS === "web") {
          const tempId = sessionStorage.getItem("tempIdentifier");
          const tempPass = sessionStorage.getItem("tempPassword");
          if (tempId && tempPass) {
            setIdentifier(tempId);
            setPassword(tempPass);
          }
        } else {
          const tempId = await SecureStore.getItemAsync("tempIdentifier");
          const tempPass = await SecureStore.getItemAsync("tempPassword");
          if (tempId && tempPass) {
            setIdentifier(tempId);
            setPassword(tempPass);
          }
        }
      }
    };
    loadCredentials();
  }, [is2FASetupMode]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyPress = (
    e: { nativeEvent: { key: string } },
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    try {
      if (is2FASetupMode) {
        // This is 2FA setup - send OTP to configure-2fa endpoint
        const resultAction = await dispatch(
          configure2FAAsync({
            enable: enable === "true",
            otpCode,
          })
        );

        if (configure2FAAsync.fulfilled.match(resultAction)) {
          console.log("2FA configuration successful");
          // Navigate back to profile with success message
          router.replace("/(tabs)/profile");
        } else {
          setError("Invalid OTP code. Please try again.");
        }
      } else {
        // This is login OTP - send to login endpoint
        const resultAction = await dispatch(
          verifyOtpAsync({
            identifier,
            password,
            otpCode,
          })
        );

        if (verifyOtpAsync.fulfilled.match(resultAction)) {
          console.log("OTP verification successful");
          // Clear temporary credentials from storage
          if (Platform.OS === "web") {
            sessionStorage.removeItem("tempIdentifier");
            sessionStorage.removeItem("tempPassword");
          } else {
            await SecureStore.deleteItemAsync("tempIdentifier");
            await SecureStore.deleteItemAsync("tempPassword");
          }
          router.replace("/(tabs)");
        } else {
          setError("Invalid OTP code. Please try again.");
        }
      }
    } catch {
      setError("An error occurred. Please try again.");
    }
  };

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");

    try {
      if (is2FASetupMode) {
        // Resend 2FA setup code by calling configure2FA without OTP
        await dispatch(
          configure2FAAsync({
            enable: enable === "true",
          })
        );
      } else {
        // Resend login OTP by calling login again without OTP
        await dispatch(
          loginAsync({
            identifier,
            password,
          })
        );
      }
      // Focus first input after resending
      const firstInput = inputRefs.current[0];
      if (firstInput) {
        firstInput.focus();
      }
    } catch (error) {
      setError("Failed to resend code. Please try again.");
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
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to your email
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref: TextInput | null) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  error && styles.otpInputError,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.submitButton,
              status === "loading" && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={status === "loading"}
          >
            <Text style={styles.submitButtonText}>
              {status === "loading" ? "Verifying..." : "Verify"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
            <Text style={styles.resendButtonText}>
              Didn't receive code? Resend
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
  inner: {
    width: "100%",
    maxWidth: 400,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  otpInput: {
    width: 56,
    height: 60,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    backgroundColor: "#fff",
    color: "#222",
  },
  otpInputFilled: {
    borderColor: "#4F8EF7",
  },
  otpInputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#4F8EF7",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resendButton: {
    alignItems: "center",
    marginBottom: 8,
  },
  resendButtonText: {
    color: "#4F8EF7",
    fontSize: 14,
    fontWeight: "500",
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  backButtonText: {
    color: "#888",
    fontSize: 14,
  },
});
