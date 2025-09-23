import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useTabs } from "@/app/(tabs)/tabContext";

export default function PatientDashboard() {
  const { setActiveTab } = useTabs();
  const upcomingAppointments = [
    {
      id: 1,
      date: "2024-09-08",
      time: "10:30 AM",
      doctor: "Dr. Sarah Johnson",
      type: "Cardiology Consultation",
      status: "confirmed",
    },
    {
      id: 2,
      date: "2024-09-15",
      time: "2:00 PM",
      doctor: "LabCorp",
      type: "Blood Work",
      status: "scheduled",
    },
  ];

  const recentResults = [
    {
      id: 1,
      test: "Complete Blood Count",
      date: "2024-09-03",
      status: "normal",
      new: true,
    },
    {
      id: 2,
      test: "Cholesterol Panel",
      date: "2024-08-28",
      status: "high",
      new: false,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Good Morning, John</Text>
            <Text style={styles.headerSubtitle}>
              How are you feeling today?
            </Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => setActiveTab("profile")}
            activeOpacity={0.7}
          >
            <Feather name="user" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Feather
            name="activity"
            size={32}
            color="#4F8EF7"
            style={styles.statIcon}
          />
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statCard}>
          <Feather
            name="file-text"
            size={32}
            color="#FFC107"
            style={styles.statIcon}
          />
          <Text style={styles.statNumber}>1</Text>
          <Text style={styles.statLabel}>New Results</Text>
        </View>
      </View>

      {/* Upcoming Appointments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="calendar" size={20} color="#4F8EF7" />
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        </View>
        {upcomingAppointments.map((appointment) => (
          <View key={appointment.id} style={styles.appointmentCard}>
            <View style={styles.appointmentIconBox}>
              <Feather name="clock" size={24} color="#4F8EF7" />
            </View>
            <View style={styles.appointmentInfo}>
              <Text style={styles.appointmentType}>{appointment.type}</Text>
              <Text style={styles.appointmentDoctor}>{appointment.doctor}</Text>
              <Text style={styles.appointmentDate}>
                {appointment.date} at {appointment.time}
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                appointment.status === "confirmed"
                  ? styles.badgeConfirmed
                  : styles.badgeScheduled,
              ]}
            >
              <Text style={styles.badgeText}>{appointment.status}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Recent Results */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="file-text" size={20} color="#4F8EF7" />
          <Text style={styles.sectionTitle}>Recent Results</Text>
        </View>
        {recentResults.map((result) => (
          <View key={result.id} style={styles.resultCard}>
            <View style={styles.resultLeft}>
              <View style={styles.resultIconBox}>
                <Feather name="file-text" size={24} color="#4F8EF7" />
              </View>
              <View>
                <View style={styles.resultTestRow}>
                  <Text style={styles.resultTest}>{result.test}</Text>
                  {result.new && (
                    <View style={styles.badgeNew}>
                      <Text style={styles.badgeNewText}>New</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.resultDate}>{result.date}</Text>
              </View>
            </View>
            <View
              style={[
                styles.badge,
                result.status === "normal"
                  ? styles.badgeNormal
                  : styles.badgeHigh,
              ]}
            >
              <Text style={styles.badgeText}>{result.status}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="calendar" size={24} color="#4F8EF7" />
            <Text style={styles.actionText}>Book Appointment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="bell" size={24} color="#4F8EF7" />
            <Text style={styles.actionText}>Set Reminder</Text>
          </TouchableOpacity>
        </View>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: { color: "#e3e8f0", fontSize: 16 },
  avatar: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: "#fff",
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: "center",
    padding: 16,
    elevation: 2,
  },
  statIcon: { marginBottom: 8 },
  statNumber: { fontSize: 24, fontWeight: "bold", color: "#222" },
  statLabel: { fontSize: 14, color: "#888" },
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
  appointmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3e8f0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  appointmentIconBox: {
    width: 44,
    height: 44,
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  appointmentInfo: { flex: 1 },
  appointmentType: { fontWeight: "bold", color: "#222" },
  appointmentDoctor: { fontSize: 13, color: "#555" },
  appointmentDate: { fontSize: 13, color: "#555" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  badgeConfirmed: { backgroundColor: "#4F8EF7" },
  badgeScheduled: { backgroundColor: "#888" },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3e8f0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    justifyContent: "space-between",
  },
  resultLeft: { flexDirection: "row", alignItems: "center" },
  resultIconBox: {
    width: 44,
    height: 44,
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  resultTestRow: { flexDirection: "row", alignItems: "center" },
  resultTest: { fontWeight: "bold", color: "#222", marginRight: 8 },
  badgeNew: {
    backgroundColor: "#FFC107",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeNewText: { color: "#fff", fontWeight: "bold", fontSize: 11 },
  resultDate: { fontSize: 13, color: "#555" },
  badgeNormal: { backgroundColor: "#4F8EF7" },
  badgeHigh: { backgroundColor: "#E53935" },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    padding: 16,
    marginHorizontal: 4,
    elevation: 2,
  },
  actionText: { marginTop: 8, color: "#222", fontWeight: "bold" },
});
