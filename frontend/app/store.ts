import {configureStore, ThunkAction, Action, createListenerMiddleware} from '@reduxjs/toolkit';
import authReducer, { loginAsync, verifyOtpAsync, initializeAuthAsync, fetchUserRolesAsync } from '../features/auth/authSlice';
import appointmentReducer from '../features/appointments/appointmentSlice';
import chatbotReducer from '../features/chatbot/chatbotSlice';

// Create listener middleware for fetching user roles after auth actions
const listenerMiddleware = createListenerMiddleware();

// Listen for successful login
listenerMiddleware.startListening({
  actionCreator: loginAsync.fulfilled,
  effect: async (action, listenerApi) => {
    if (!action.payload.requiresOtp && action.payload.accessToken) {
      const state = listenerApi.getState() as RootState;
      const userId = state.auth.userId;
      if (userId) {
        (listenerApi.dispatch as AppDispatch)(fetchUserRolesAsync(userId));
      }
    }
  },
});

// Listen for successful OTP verification
listenerMiddleware.startListening({
  actionCreator: verifyOtpAsync.fulfilled,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const userId = state.auth.userId;
    if (userId) {
      (listenerApi.dispatch as AppDispatch)(fetchUserRolesAsync(userId));
    }
  },
});

// Listen for successful auth initialization
listenerMiddleware.startListening({
  actionCreator: initializeAuthAsync.fulfilled,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const userId = state.auth.userId;
    if (userId) {
      (listenerApi.dispatch as AppDispatch)(fetchUserRolesAsync(userId));
    }
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentReducer,
    chatbot: chatbotReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
