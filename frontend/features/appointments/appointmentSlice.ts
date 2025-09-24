import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

// Define the API base URL using environment variable
const backendApi = process.env.EXPO_PUBLIC_API_URL;

// Appointment Status enum matching the backend
export enum AppointmentStatus {
  Pending = 0,
  Confirmed = 1,
  Cancelled = 2,
  Completed = 3,
}

// Types for Appointment
export interface Appointment {
  id: string;
  title: string;
  doctorName: string;
  appointmentDateTime: string;
  description: string;
  status: AppointmentStatus;
  userId: string;
}

// Types for creating an appointment
export interface CreateAppointmentRequest {
  title: string;
  doctorName: string;
  appointmentDateTime: string;
  userId: string;
  description: string;
}

// Types for updating an appointment
export interface UpdateAppointmentRequest {
  id: string;
  title: string;
  doctorName: string;
  appointmentDateTime: string;
  description: string;
  status: AppointmentStatus;
}

// Define the state interface
interface AppointmentState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: AppointmentState = {
  appointments: [],
  currentAppointment: null,
  status: 'idle',
  error: null,
};

// Async thunks for API calls
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAll',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const accessToken = state.auth.accessToken;
      
      const response = await fetch(`${backendApi}/api/Appointments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchById',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const accessToken = state.auth.accessToken;
      
      const response = await fetch(`${backendApi}/api/Appointments/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchUserAppointments = createAsyncThunk(
  'appointments/fetchUserAppointments',
  async (userId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const accessToken = state.auth.accessToken;
      
      const response = await fetch(`${backendApi}/api/Appointments/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (appointmentData: CreateAppointmentRequest, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const accessToken = state.auth.accessToken;
      
      const response = await fetch(`${backendApi}/api/Appointments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(appointmentData),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/update',
  async (appointmentData: UpdateAppointmentRequest, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const accessToken = state.auth.accessToken;
      
      const response = await fetch(`${backendApi}/api/Appointments/update/${appointmentData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(appointmentData),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const confirmAppointment = createAsyncThunk(
  'appointments/confirm',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const accessToken = state.auth.accessToken;
      
      const response = await fetch(`${backendApi}/api/Appointments/confirm/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancel',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const accessToken = state.auth.accessToken;
      
      const response = await fetch(`${backendApi}/api/Appointments/cancel/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointments/delete',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const accessToken = state.auth.accessToken;
      
      const response = await fetch(`${backendApi}/api/Appointments/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return id; // Return the ID for the reducer to remove from state
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Create the slice
const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
    resetAppointmentState: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAppointments
      .addCase(fetchAppointments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.status = 'succeeded';
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchAppointmentById
      .addCase(fetchAppointmentById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.status = 'succeeded';
        state.currentAppointment = action.payload;
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchUserAppointments
      .addCase(fetchUserAppointments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserAppointments.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.status = 'succeeded';
        state.appointments = action.payload;
      })
      .addCase(fetchUserAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle createAppointment
      .addCase(createAppointment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.status = 'succeeded';
        state.appointments.push(action.payload);
        state.currentAppointment = action.payload;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle updateAppointment
      .addCase(updateAppointment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.status = 'succeeded';
        const index = state.appointments.findIndex(appointment => appointment.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        state.currentAppointment = action.payload;
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle confirmAppointment
      .addCase(confirmAppointment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(confirmAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.status = 'succeeded';
        const index = state.appointments.findIndex(appointment => appointment.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.currentAppointment?.id === action.payload.id) {
          state.currentAppointment = action.payload;
        }
      })
      .addCase(confirmAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle cancelAppointment
      .addCase(cancelAppointment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.status = 'succeeded';
        const index = state.appointments.findIndex(appointment => appointment.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.currentAppointment?.id === action.payload.id) {
          state.currentAppointment = action.payload;
        }
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle deleteAppointment
      .addCase(deleteAppointment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.appointments = state.appointments.filter(appointment => appointment.id !== action.payload);
        if (state.currentAppointment?.id === action.payload) {
          state.currentAppointment = null;
        }
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { clearCurrentAppointment, resetAppointmentState } = appointmentSlice.actions;

// Export selectors
export const selectAllAppointments = (state: RootState) => state.appointments.appointments;
export const selectAppointmentById = (state: RootState, appointmentId: string) => 
  state.appointments.appointments.find((appointment: Appointment) => appointment.id === appointmentId);
export const selectCurrentAppointment = (state: RootState) => state.appointments.currentAppointment;
export const selectAppointmentsStatus = (state: RootState) => state.appointments.status;
export const selectAppointmentsError = (state: RootState) => state.appointments.error;

export default appointmentSlice.reducer;
