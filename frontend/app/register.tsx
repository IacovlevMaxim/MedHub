import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { registerAsync, selectAuthStatus } from "@/features/auth/authSlice";
import useInputField from "@/hooks/useInputField";
import InputField from "@/components/InputField";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { Colors } from "@/constants/Colors";
import Icon from "react-native-vector-icons/FontAwesome5";

interface RegisterBody {
  [key: string]: string;
  date_of_birth: string;
}

const emailValidation = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "Enter a valid email address.";
  return undefined;
};

const idnpValidation = (value: string) => {
  const idnpRegex = /^\d{13}$/; // Example: IDNP must be exactly 13 digits
  if (!idnpRegex.test(value)) return "IDNP must be exactly 13 digits.";
  return undefined;
};

const passwordValidation = (value: string) => {
  if (value.length < 6) return "Password must be at least 6 characters.";
  return undefined;
};

export default function Register() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const nameField = useInputField({
    label: "Name",
    field: "fullName",
    value: "",
  });
  const emailField = useInputField({
    label: "Email",
    field: "email",
    value: "",
    validationFn: emailValidation,
  });
  const idnpField = useInputField({
    label: "IDNP",
    field: "idnp",
    value: "",
    validationFn: idnpValidation,
  });
  const passwordField = useInputField({
    label: "Password",
    field: "password",
    value: "",
    secureTextEntry: true,
    validationFn: passwordValidation,
  });
  const streetField = useInputField({
    label: "Street",
    field: "street",
    value: "",
  });

  const fields = [nameField, idnpField, emailField, passwordField, streetField];

  const validateForm = () => {
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
      const body: RegisterBody = fields.reduce(
        (acc, field) => {
          acc[field.field] = field.value;
          return acc;
        },
        {
          date_of_birth: date.toISOString().split("T")[0],
          username: emailField.value,
        } as RegisterBody
      );

      try {
        const resultAction = await dispatch(registerAsync(body));
        if (registerAsync.fulfilled.match(resultAction)) {
          // Registration successful, navigation handled elsewhere
          router.replace("/login")
        } else {
          Alert.alert("Failed to register", "Please try again later.");
        }
      } catch {
        Alert.alert("Failed to register", "Please try again later.");
      }
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
                <Icon name="user-plus" color="#fff" size={28} />
              </Text>
            </View>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Join MedHub to manage your records and appointments
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign Up</Text>
            <View style={styles.form}>
              <InputField
                label="Full Name"
                value={nameField.value}
                setValue={nameField.setValue}
                error={nameField.error}
              />
              <InputField
                label="IDNP"
                value={idnpField.value}
                setValue={idnpField.setValue}
                error={idnpField.error}
              />
              <InputField
                label="Email"
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
              <InputField
                label="Street"
                value={streetField.value}
                setValue={streetField.setValue}
                error={streetField.error}
              />

              {/* Date of Birth */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth</Text>
                {Platform.OS === "web" ? (
                  <input
                    type="date"
                    value={date.toISOString().split("T")[0]}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value);
                      setDate(newDate);
                    }}
                    style={styles.input as unknown as React.CSSProperties}
                  />
                ) : (
                  <RNDateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      const currentDate = selectedDate || date;
                      setDate(currentDate);
                    }}
                  />
                )}
              </View>

              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleSubmit}
                disabled={status === "loading"}
              >
                <Text style={styles.signInButtonText}>
                  {status === "loading" ? "Registering..." : "Create Account"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actions}>
              <Link href="/login" asChild>
                <TouchableOpacity style={styles.ghostButton}>
                  <Text style={styles.ghostButtonText}>
                    Already have an account? Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          <Text style={styles.terms}>
            By creating an account, you agree to our Terms of Service and
            Privacy Policy
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
