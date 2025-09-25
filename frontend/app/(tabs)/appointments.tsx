import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { 
  fetchUserAppointments, 
  fetchAppointments,
  cancelAppointment,
  selectAllAppointments, 
  selectAppointmentsStatus, 
  selectAppointmentsError,
  AppointmentStatus,
  Appointment
} from "@/features/appointments/appointmentSlice";
import { refreshAccessTokenAsync } from '@/features/auth/authSlice';
import { useRouter } from 'expo-router';

// import { AuthGuard } from "@/hooks/useAuth";

export default function AppointmentsView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const appointments = useAppSelector(selectAllAppointments);
  const status = useAppSelector(selectAppointmentsStatus);
  const error = useAppSelector(selectAppointmentsError);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAppointmentsWithRetry = async () => {
      const result = await dispatch(fetchAppointments());

      console.log('Fetch appointments result:', result);

      if (fetchAppointments.rejected.match(result) && result.error.message?.includes('401')) {
        const refreshResult = await dispatch(refreshAccessTokenAsync());

        if (refreshAccessTokenAsync.rejected.match(refreshResult)) {
          router.replace('/login');
        } else {
          dispatch(fetchAppointments());
        }
      }
    };

    fetchAppointmentsWithRetry();
  }, [dispatch, router]);

  // Function to format date and time from appointment data
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Function to handle appointment cancellation
  const handleCancelAppointment = (id: string) => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes", 
          onPress: () => {
            dispatch(cancelAppointment(id));
          }
        }
      ]
    );
  };

  // Map API appointment status to UI status
  const mapStatusToUI = (status: AppointmentStatus): string => {
    switch (status) {
      case AppointmentStatus.Confirmed:
        return "confirmed";
      case AppointmentStatus.Pending:
        return "pending";
      case AppointmentStatus.Cancelled:
        return "cancelled";
      case AppointmentStatus.Completed:
        return "completed";
      default:
        return "scheduled";
    }
  };

  // Get status color based on appointment status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return { backgroundColor: "#4F8EF7" };
      case "scheduled":
        return { backgroundColor: "#4F8EF7" };
      case "pending":
        return { backgroundColor: "#FFC107" };
      case "cancelled":
        return { backgroundColor: "#FF6B6B" };
      case "completed":
        return { backgroundColor: "#4CAF50" };
      default:
        return { backgroundColor: "#888" };
    }
  };

  return (
    // <AuthGuard>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>My Appointments</Text>
              <Text style={styles.headerSubtitle}>Manage your healthcare schedule</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <Feather name="plus" size={24} color="#4F8EF7" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading State */}
        {status === 'loading' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F8EF7" />
            <Text style={{ marginTop: 16, color: '#666' }}>Loading appointments...</Text>
          </View>
        )}

        {/* Error State */}
        {status === 'failed' && error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-triangle" size={48} color="#FF6B6B" />
            <Text style={{ marginTop: 16, color: '#666', textAlign: 'center' }}>
              {error}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => dispatch(fetchAppointments())}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Appointment List */}
        {status === 'succeeded' && (
          <View style={{ marginHorizontal: 16, marginTop: 16 }}>
            {appointments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="calendar" size={64} color="#4F8EF7" style={{ opacity: 0.5 }} />
                <Text style={styles.emptyText}>No appointments found</Text>
                <Text style={styles.emptySubText}>
                  You don't have any appointments scheduled yet. Book one now!
                </Text>
              </View>
            ) : (
              appointments.map((appointment) => {
                const dateTime = formatDateTime(appointment.appointmentDateTime);
                
                return (
                  <View key={appointment.id} style={styles.appointmentCard}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.typeTitle}>{appointment.title}</Text>
                        <Text style={styles.doctorText}>{appointment.doctorName}</Text>
                        <Text style={styles.specialtyText}>
                          {/* Use the doctor's specialty or a default value */}
                          {appointment.description || "Consultation"}
                        </Text>
                      </View>
                      <View style={[styles.badge, getStatusColor(mapStatusToUI(appointment.status))]}>
                        <Text style={styles.badgeText}>{mapStatusToUI(appointment.status)}</Text>
                      </View>
                    </View>
                    <View style={{ marginBottom: 12 }}>
                      <View style={styles.infoRow}>
                        <Feather name="calendar" size={16} color="#4F8EF7" style={{ marginRight: 6 }} />
                        <Text style={styles.infoText}>{dateTime.date}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Feather name="clock" size={16} color="#4F8EF7" style={{ marginRight: 6 }} />
                        <Text style={styles.infoText}>{dateTime.time}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Feather name="map-pin" size={16} color="#4F8EF7" style={{ marginRight: 6 }} />
                        <Text style={styles.infoText}>Hospital Location</Text>
                      </View>
                    </View>
                    {appointment.description && (
                      <View style={styles.prepCard}>
                        <Text style={styles.prepTitle}>Notes:</Text>
                        <Text style={styles.prepText}>{appointment.description}</Text>
                      </View>
                    )}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Feather name="phone" size={16} color="#4F8EF7" style={{ marginRight: 6 }} />
                        <Text style={styles.actionText}>Call</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionText}>Reschedule</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleCancelAppointment(appointment.id)}
                      >
                        <Text style={styles.actionText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Book New Appointment */}
        <View style={styles.bookCard}>
          <Feather name="calendar" size={48} color="#4F8EF7" style={{ alignSelf: "center", marginBottom: 12 }} />
          <Text style={styles.bookTitle}>Need a New Appointment?</Text>
          <Text style={styles.bookDesc}>Book with your preferred healthcare provider</Text>
          <TouchableOpacity style={styles.bookButton}>
            <Feather name="plus" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.bookButtonText}>Book New Appointment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: {
    backgroundColor: "#dbeafe",
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#222", marginBottom: 4 },
  headerSubtitle: { color: "#888", fontSize: 15 },
  addButton: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: "#e3e8f0",
    alignItems: "center", justifyContent: "center"
  },
  appointmentCard: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 24,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  typeTitle: { fontWeight: "bold", fontSize: 16, color: "#222" },
  doctorText: { fontSize: 13, color: "#888" },
  specialtyText: { fontSize: 13, color: "#888" },
  badge: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    alignItems: "center", justifyContent: "center"
  },
  badgeText: { color: "#fff", fontWeight: "bold", fontSize: 12, textTransform: "capitalize" },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  infoText: { fontSize: 14, color: "#222" },
  prepCard: {
    backgroundColor: "#FFF8E1", borderRadius: 8, padding: 10, marginBottom: 12
  },
  prepTitle: { color: "#FFC107", fontWeight: "bold", fontSize: 13, marginBottom: 2 },
  prepText: { color: "#222", fontSize: 13 },
  actionsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  actionButton: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 8, padding: 10, flex: 1, marginHorizontal: 2, borderWidth: 1, borderColor: "#e3e8f0"
  },
  actionText: { color: "#222", fontWeight: "bold", fontSize: 13 },
  bookCard: {
    backgroundColor: "#dbeafe", borderRadius: 12, alignItems: "center", padding: 24, margin: 16
  },
  bookTitle: { fontWeight: "bold", color: "#4F8EF7", fontSize: 16, marginBottom: 4 },
  bookDesc: { color: "#888", fontSize: 13, marginBottom: 12, textAlign: "center" },
  bookButton: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#4F8EF7",
    borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10, marginTop: 8
  },
  bookButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  // New styles for added components
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  errorContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  retryButton: {
    backgroundColor: "#4F8EF7",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold"
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 8
  }
});