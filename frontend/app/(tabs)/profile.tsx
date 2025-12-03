import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  clearTokens,
  logOut,
  configure2FAAsync,
  selectAuthStatus,
  selectIs2FAEnabled,
} from "@/features/auth/authSlice";
import { router } from "expo-router";

export default function ProfileView() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const is2FAEnabled = useAppSelector(selectIs2FAEnabled);
  const [isLoading2FA, setIsLoading2FA] = useState(false);

  const handle2FAToggle = async (value: boolean) => {
    if (isLoading2FA) return;

    setIsLoading2FA(true);

    try {
      const resultAction = await dispatch(configure2FAAsync({ enable: value }));

      if (configure2FAAsync.fulfilled.match(resultAction)) {
        if (resultAction.payload.requiresOtp) {
          // OTP sent to email, navigate to OTP page
          setIsLoading2FA(false);
          router.push({
            pathname: "/otp-verification" as any,
            params: {
              is2FASetup: "true",
              enable: value ? "true" : "false",
            },
          });
        } else {
          // 2FA successfully configured (with OTP already verified)
          setIsLoading2FA(false);
        }
      } else {
        // Failed
        setIsLoading2FA(false);
      }
    } catch (error) {
      setIsLoading2FA(false);
    }
  };

  const promptForOTP = (enableValue: boolean) => {
    // Navigate to a dedicated 2FA setup page with OTP input
    router.push({
      pathname: "/otp-verification" as any,
      params: {
        identifier: "2fa-setup",
        password: "2fa-setup",
        is2FASetup: "true",
        enable: enableValue ? "true" : "false",
      },
    });
  };

  const patientInfo = {
    name: "John Anderson",
    dateOfBirth: "1985-03-15",
    age: 39,
    gender: "Male",
    bloodType: "A+",
    phone: "+1 (555) 123-4567",
    email: "john.anderson@email.com",
    address: "123 Oak Street, Springfield, IL 62701",
    emergencyContact: {
      name: "Sarah Anderson",
      relationship: "Spouse",
      phone: "+1 (555) 987-6543",
    },
  };

  const connectedProviders = [
    {
      name: "Springfield General Hospital",
      status: "active",
      color: "#4F8EF7",
    },
    { name: "LabCorp Diagnostics", status: "active", color: "#4F8EF7" },
    { name: "MedStar Family Practice", status: "pending", color: "#FFC107" },
  ];

  const healthStats = [
    { label: "Height", value: "5'10\"", icon: "activity" },
    { label: "Weight", value: "175 lbs", icon: "activity" },
    { label: "BMI", value: "25.1", icon: "heart" },
    { label: "Blood Type", value: "A+", icon: "heart" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Feather name="user" size={32} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{patientInfo.name}</Text>
            <Text style={styles.headerSubtitle}>
              Age {patientInfo.age} • {patientInfo.gender}
            </Text>
            <Text style={styles.headerSubtitleSmall}>
              DOB: {patientInfo.dateOfBirth}
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Feather name="edit" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Health Stats */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="activity" size={20} color="#4F8EF7" />
          <Text style={styles.sectionTitle}>Health Information</Text>
        </View>
        <View style={styles.statsGrid}>
          {healthStats.map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <Feather
                name={stat.icon}
                size={24}
                color="#4F8EF7"
                style={{ marginBottom: 6 }}
              />
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoRow}>
          <Feather name="phone" size={20} color="#4F8EF7" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.infoValue}>{patientInfo.phone}</Text>
            <Text style={styles.infoLabel}>Mobile</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Feather name="mail" size={20} color="#4F8EF7" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.infoValue}>{patientInfo.email}</Text>
            <Text style={styles.infoLabel}>Email</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Feather name="map-pin" size={20} color="#4F8EF7" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.infoValue}>{patientInfo.address}</Text>
            <Text style={styles.infoLabel}>Home Address</Text>
          </View>
        </View>
      </View>

      {/* Emergency Contact */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: "#E53935" }]}>
          Emergency Contact
        </Text>
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Text style={styles.emergencyName}>
              {patientInfo.emergencyContact.name}
            </Text>
            <View style={styles.badgeOutline}>
              <Text style={styles.badgeOutlineText}>
                {patientInfo.emergencyContact.relationship}
              </Text>
            </View>
          </View>
          <Text style={styles.infoLabel}>
            {patientInfo.emergencyContact.phone}
          </Text>
        </View>
      </View>

      {/* Connected Providers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="shield" size={20} color="#4F8EF7" />
          <Text style={styles.sectionTitle}>
            Connected Healthcare Providers
          </Text>
        </View>
        {connectedProviders.map((provider, idx) => (
          <View key={idx} style={styles.providerCard}>
            <View style={styles.providerLeft}>
              <View style={styles.providerIconBox}>
                <Feather name="shield" size={20} color="#4F8EF7" />
              </View>
              <View>
                <Text style={styles.providerName}>{provider.name}</Text>
                <Text style={styles.providerLabel}>Healthcare Provider</Text>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: provider.color }]}>
              <Text style={styles.badgeText}>{provider.status}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Settings & Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings & Privacy</Text>

        {/* 2FA Toggle */}
        <View style={styles.actionButton}>
          <Feather
            name="shield"
            size={20}
            color="#4F8EF7"
            style={{ marginRight: 12 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.actionText}>Two-Factor Authentication</Text>
            <Text style={styles.actionSubtext}>
              Require OTP code when logging in
            </Text>
          </View>
          <Switch
            value={is2FAEnabled}
            onValueChange={handle2FAToggle}
            disabled={isLoading2FA}
            trackColor={{ false: "#D0D0D0", true: "#4F8EF7" }}
            thumbColor={is2FAEnabled ? "#fff" : "#f4f3f4"}
          />
        </View>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push("/change-password")}
        >
          <Feather
            name="lock"
            size={20}
            color="#4F8EF7"
            style={{ marginRight: 12 }}
          />
          <Text style={styles.actionText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: "#E53935" }]}
          onPress={() => {
            dispatch(clearTokens());
            router.replace("/login");
          }}
        >
          <Feather
            name="log-out"
            size={20}
            color="#E53935"
            style={{ marginRight: 12 }}
          />
          <Text style={[styles.actionText, { color: "#E53935" }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={[styles.section, styles.appInfoCard]}>
        <Text style={styles.appInfoTitle}>MedHub</Text>
        <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
        <Text style={styles.appInfoDesc}>
          Your personal medical cabinet for managing appointments, results, and
          health records securely.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: {
    backgroundColor: "#4F8EF7",
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: { color: "#e3e8f0", fontSize: 16 },
  headerSubtitleSmall: { color: "#e3e8f0", fontSize: 13 },
  editButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    padding: 8,
    marginLeft: 8,
  },
  section: { marginHorizontal: 16, marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#222",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#e3e8f0",
    borderRadius: 10,
    padding: 12,
    width: "48%",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: { fontSize: 13, color: "#555" },
  statValue: { fontWeight: "bold", color: "#222", fontSize: 15 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  infoValue: { fontWeight: "bold", color: "#222", fontSize: 15 },
  infoLabel: { fontSize: 13, color: "#555" },
  emergencyCard: {
    backgroundColor: "#FDECEA",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  emergencyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  emergencyName: { fontWeight: "bold", color: "#222", fontSize: 15 },
  badgeOutline: {
    borderWidth: 1,
    borderColor: "#E53935",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeOutlineText: { color: "#E53935", fontWeight: "bold", fontSize: 12 },
  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3e8f0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    justifyContent: "space-between",
  },
  providerLeft: { flexDirection: "row", alignItems: "center" },
  providerIconBox: {
    width: 40,
    height: 40,
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  providerName: { fontWeight: "bold", color: "#222", fontSize: 14 },
  providerLabel: { fontSize: 12, color: "#555" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e3e8f0",
  },
  actionText: { color: "#222", fontWeight: "bold", fontSize: 15 },
  actionSubtext: { fontSize: 12, color: "#888", marginTop: 2 },
  appInfoCard: {
    backgroundColor: "#dbeafe",
    borderRadius: 10,
    alignItems: "center",
    padding: 16,
  },
  appInfoTitle: {
    fontWeight: "bold",
    color: "#4F8EF7",
    fontSize: 16,
    marginBottom: 4,
  },
  appInfoVersion: { color: "#222", fontSize: 13, marginBottom: 4 },
  appInfoDesc: { color: "#555", fontSize: 12, textAlign: "center" },
});
