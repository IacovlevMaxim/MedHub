import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome5";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppDispatch } from "@/hooks/useRedux";
import { confirmEmailAsync } from "@/features/auth/authSlice";

export default function ConfirmEmail() {
  const dispatch = useAppDispatch();
  const { email, token } = useLocalSearchParams<{ email: string; token: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const confirmEmail = async () => {
      if(!email || !token) {
        setIsSuccess(false);
        setIsLoading(false);
        return;
      }

      try {
        const resultAction = await dispatch(
          confirmEmailAsync({ 
            email,
            token
          })
        );
        
        setIsSuccess(confirmEmailAsync.fulfilled.match(resultAction));
      } catch (error) {
        setIsSuccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    confirmEmail();
  }, [email, token, dispatch]);

  const handleGoToMainPage = () => {
    router.replace("/login");
  };

  if (isLoading) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.inner}>
          <ActivityIndicator size="large" color="#4F8EF7" />
          <Text style={[styles.subtitle, { marginTop: 16 }]}>
            Confirming your email...
          </Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (!isSuccess) {
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
              <View style={[styles.logoCircle, { backgroundColor: "#FF6B6B" }]}>
                <Text style={styles.logoText}>
                  <Icon name="times" color="#fff" size={28} />
                </Text>
              </View>
              <Text style={styles.title}>Activation Failed</Text>
              <Text style={styles.subtitle}>
                Something went wrong when activating your account
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Oops!</Text>
              <Text style={styles.cardBody}>
                We couldn't activate your account. The link may be invalid or expired.
                Please try requesting a new confirmation email.
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleGoToMainPage}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Go to login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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
                <Icon name="check" color="#fff" size={28} />
              </Text>
            </View>
            <Text style={styles.title}>Account activated</Text>
            <Text style={styles.subtitle}>
              Your account is ready. You can now continue.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>All set!</Text>
            <Text style={styles.cardBody}>
              Your account has been successfully activated.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGoToMainPage}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Go to login</Text>
            </TouchableOpacity>
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
    backgroundColor: "#4CAF50",
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
    marginBottom: 8,
    color: "#222",
  },
  cardBody: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#4F8EF7",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
