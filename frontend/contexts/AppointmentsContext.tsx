import React, { createContext, useContext, useState, ReactNode } from "react";

export enum AppointmentStatus {
  Pending = 0,
  Confirmed = 1,
  Cancelled = 2,
  Completed = 3,
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  appointmentDateTime: string;
  title: string;
  description?: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentsContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, "id">) => void;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(
  undefined
);

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error("useAppointments must be used within AppointmentsProvider");
  }
  return context;
};

interface AppointmentsProviderProps {
  children: ReactNode;
}

export const AppointmentsProvider = ({
  children,
}: AppointmentsProviderProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      patientId: "user123",
      doctorId: "doc1",
      doctorName: "Dr. Sarah Johnson",
      appointmentDateTime: "2024-09-08T10:30:00",
      title: "Follow-up Consultation",
      description: "Bring previous ECG reports",
      status: AppointmentStatus.Confirmed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      patientId: "user123",
      doctorId: "lab1",
      doctorName: "LabCorp Diagnostics",
      appointmentDateTime: "2024-09-15T14:00:00",
      title: "Blood Work - Comprehensive Panel",
      description: "Fast for 12 hours before test",
      status: AppointmentStatus.Confirmed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      patientId: "user123",
      doctorId: "doc2",
      doctorName: "Dr. Michael Chen",
      appointmentDateTime: "2024-09-22T15:30:00",
      title: "Annual Skin Check",
      description: "Remove nail polish and makeup",
      status: AppointmentStatus.Pending,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const addAppointment = (appointment: Omit<Appointment, "id">) => {
    const newId = String(
      appointments.length > 0
        ? Math.max(...appointments.map((a) => parseInt(a.id))) + 1
        : 1
    );
    const newAppointment: Appointment = {
      id: newId,
      ...appointment,
    };
    setAppointments((prev) => [...prev, newAppointment]);
  };

  return (
    <AppointmentsContext.Provider value={{ appointments, addAppointment }}>
      {children}
    </AppointmentsContext.Provider>
  );
};
