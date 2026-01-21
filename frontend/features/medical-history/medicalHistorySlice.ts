import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Alert } from 'react-native';
import { RootState } from '../../app/store';

// Define the API base URL using environment variable
const backendApi = process.env.EXPO_PUBLIC_API_URL || '';

// Types for Recommendation
export interface Recommendation {
  id: string;
  text: string;
}

// Types for Prescription
export interface Prescription {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

// Types for Medical History
export interface MedicalHistory {
  id: string;
  date: string;
  doctor: string;
  specialty: string;
  visitType: string;
  diagnosis: string;
  summary: string;
  recommendations: Recommendation[];
  prescriptions: Prescription[];
}

// Define the state interface
interface MedicalHistoryState {
  medicalHistory: MedicalHistory[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: MedicalHistoryState = {
  medicalHistory: [],
  status: 'idle',
  error: null,
};

// Async thunk for fetching medical history
export const fetchMedicalHistory = createAsyncThunk(
  'medicalHistory/fetchMy',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const accessToken = state.auth.accessToken;
      
      const response = await fetch(`${backendApi}/api/MedicalHistory/my`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        Alert.alert(
          'Authorization Error',
          'Unable to authorize the user. Please log in again.',
          [{ text: 'OK' }]
        );
        return rejectWithValue('Authorization failed. Please log in again.');
      }
      
      // Handle 403 Forbidden - Authorization error
      if (response.status === 403) {
        Alert.alert(
          'Authorization Error',
          'You do not have permission to access your medical history. Please log in again.',
          [{ text: 'OK' }]
        );
        return rejectWithValue('Authorization failed. Please log in again.');
      }
      
      // Handle 404 Not Found - Medical history not found
      if (response.status === 404) {
        const errorData = await response.json();
        Alert.alert(
          'Not Found',
          errorData.error || 'Medical history record not found.',
          [{ text: 'OK' }]
        );
        return rejectWithValue(errorData.error || 'Medical history record not found.');
      }
      
      // Handle other non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use the text or default message
          errorMessage = errorText || errorMessage;
        }
        
        Alert.alert(
          'Error',
          errorMessage,
          [{ text: 'OK' }]
        );
        return rejectWithValue(errorMessage);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      const errorMessage = (error as Error).message;
      Alert.alert(
        'Network Error',
        `Failed to fetch medical history: ${errorMessage}`,
        [{ text: 'OK' }]
      );
      return rejectWithValue(errorMessage);
    }
  }
);

// Create the slice
const medicalHistorySlice = createSlice({
  name: 'medicalHistory',
  initialState,
  reducers: {
    resetMedicalHistoryState: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    clearMedicalHistory: (state) => {
      state.medicalHistory = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchMedicalHistory
      .addCase(fetchMedicalHistory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMedicalHistory.fulfilled, (state, action: PayloadAction<MedicalHistory[]>) => {
        state.status = 'succeeded';
        state.medicalHistory = action.payload;
      })
      .addCase(fetchMedicalHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { resetMedicalHistoryState, clearMedicalHistory } = medicalHistorySlice.actions;

// Export selectors
export const selectMedicalHistory = (state: RootState) => state.medicalHistory.medicalHistory;
export const selectMedicalHistoryStatus = (state: RootState) => state.medicalHistory.status;
export const selectMedicalHistoryError = (state: RootState) => state.medicalHistory.error;

export default medicalHistorySlice.reducer;
