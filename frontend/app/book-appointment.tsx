import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import InputField from "@/components/InputField";
import useInputField from "@/hooks/useInputField";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { createAppointment, CreateAppointmentRequest } from "@/features/appointments/appointmentSlice";
import { selectUserId } from "@/features/auth/authSlice";

const specialties = [
  "Cardiology",
  "Dermatology",
  "General Practice",
  "Laboratory",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
];

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

export default function BookAppointment() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUserId);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasonField = useInputField({
    label: "Reason for Visit",
    field: "reason",
    value: "",
  });

  const notesField = useInputField({
    label: "Additional Notes",
    field: "notes",
    value: "",
  });

  const handleBookAppointment = async () => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to book an appointment");
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time into ISO datetime string
      const [hours, minutes] = selectedTimeSlot
        .replace(/AM|PM/, "")
        .trim()
        .split(":")
        .map(Number);
      const isPM = selectedTimeSlot.includes("PM");
      const adjustedHours = isPM && hours !== 12 ? hours + 12 : hours === 12 && !isPM ? 0 : hours;

      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(adjustedHours, minutes, 0, 0);

      // Create appointment request
      const appointmentRequest: CreateAppointmentRequest = {
        userId: userId,
        doctorName: "TBD - To be assigned",
        appointmentDateTime: appointmentDate.toISOString(),
        title: `${selectedSpecialty} - ${reasonField.value}`,
        description: notesField.value || "",
      };

      console.log('sending request');

      // Dispatch create appointment action
      const result = await dispatch(createAppointment(appointmentRequest)).unwrap();

      Alert.alert(
        "Success",
        "Appointment booked successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to book appointment: ${error}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <Text style={styles.headerSubtitle}>
            Schedule your healthcare visit
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Select Specialty */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Specialty</Text>
          <View style={styles.chipContainer}>
            {specialties.map((specialty) => (
              <TouchableOpacity
                key={specialty}
                style={[
                  styles.chip,
                  selectedSpecialty === specialty && styles.chipSelected,
                ]}
                onPress={() => setSelectedSpecialty(specialty)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedSpecialty === specialty && styles.chipTextSelected,
                  ]}
                >
                  {specialty}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Select Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          {Platform.OS === "web" ? (
            <input
              type="date"
              value={selectedDate.toISOString().split("T")[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                setSelectedDate(newDate);
              }}
              style={styles.webDateInput as unknown as React.CSSProperties}
            />
          ) : (
            <RNDateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, date) => {
                if (date) setSelectedDate(date);
              }}
            />
          )}
        </View>

        {/* Select Time Slot */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timeSlotContainer}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.timeSlot,
                  selectedTimeSlot === slot && styles.timeSlotSelected,
                ]}
                onPress={() => setSelectedTimeSlot(slot)}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedTimeSlot === slot && styles.timeSlotTextSelected,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reason for Visit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason for Visit</Text>
          <InputField
            label="Reason for Visit"
            value={reasonField.value}
            setValue={reasonField.setValue}
            error={reasonField.error}
          />
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
          <InputField
            label="Additional Notes"
            value={notesField.value}
            setValue={notesField.setValue}
            error={notesField.error}
          />
        </View>

        {/* Book Button */}
        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedSpecialty || !selectedTimeSlot || !reasonField.value || isSubmitting) &&
              styles.bookButtonDisabled,
          ]}
          onPress={handleBookAppointment}
          disabled={
            !selectedSpecialty || !selectedTimeSlot || !reasonField.value || isSubmitting
          }
        >
          <Feather name="calendar" size={20} color="#fff" />
          <Text style={styles.bookButtonText}>
            {isSubmitting ? "Booking..." : "Confirm Booking"}
          </Text>
        </TouchableOpacity>

        {/* Summary Card */}
        {selectedSpecialty && selectedTimeSlot && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Appointment Summary</Text>
            <View style={styles.summaryRow}>
              <Feather name="briefcase" size={16} color="#4F8EF7" />
              <Text style={styles.summaryText}>{selectedSpecialty}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Feather name="calendar" size={16} color="#4F8EF7" />
              <Text style={styles.summaryText}>
                {selectedDate.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Feather name="clock" size={16} color="#4F8EF7" />
              <Text style={styles.summaryText}>{selectedTimeSlot}</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  header: {
    backgroundColor: "#dbeafe",
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#888",
    fontSize: 15,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e3e8f0",
  },
  chipSelected: {
    backgroundColor: "#4F8EF7",
    borderColor: "#4F8EF7",
  },
  chipText: {
    color: "#222",
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#fff",
  },
  webDateInput: {
    height: 44,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e3e8f0",
    paddingHorizontal: 12,
    fontSize: 16,
  },
  timeSlotContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeSlot: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e3e8f0",
    minWidth: 100,
    alignItems: "center",
  },
  timeSlotSelected: {
    backgroundColor: "#4F8EF7",
    borderColor: "#4F8EF7",
  },
  timeSlotText: {
    color: "#222",
    fontSize: 14,
    fontWeight: "500",
  },
  timeSlotTextSelected: {
    color: "#fff",
  },
  bookButton: {
    backgroundColor: "#4F8EF7",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  bookButtonDisabled: {
    backgroundColor: "#ccc",
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e3e8f0",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  summaryText: {
    color: "#222",
    fontSize: 14,
  },
});
