import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import appointmentReducer from '../features/appointments/appointmentSlice';
import chatbotReducer from '../features/chatbot/chatbotSlice';
import medicalHistoryReducer from '../features/medical-history/medicalHistorySlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentReducer,
    chatbot: chatbotReducer,
    medicalHistory: medicalHistoryReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
