import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';
import * as SecureStore from 'expo-secure-store';

const backendApi = process.env.EXPO_PUBLIC_API_URL;

interface AuthState {
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshToken: string | null;
  refreshTokenExpiresAt: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  accessTokenExpiresAt: null,
  refreshToken: null,
  refreshTokenExpiresAt: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

// Async thunk for forgot password
export const forgotPasswordAsync = createAsyncThunk<
  {message: string},
  {email: string},
  {state: RootState; rejectValue: string}
>(
  'auth/forgotPassword',
  async (payload, thunkAPI) => {
    const response = await fetch(`${backendApi}/api/Auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      try {
        const data = await response.json();
        return thunkAPI.rejectWithValue(data.message || data.error || 'Failed to send reset link');
      } catch {
        const text = await response.text();
        return thunkAPI.rejectWithValue(text || 'Failed to send reset link');
      }
    }

    const data = await response.json();
    return data;
  }
);

// Async thunk for registration
export const registerAsync = createAsyncThunk<
  {accessToken: string; accessTokenExpiresAt: string; refreshToken: string; refreshTokenExpiresAt: string},
  any,
  {state: RootState; rejectValue: string}
>(
  'auth/register',
  async (registerData, thunkAPI) => {
    const response = await fetch(`${backendApi}/api/Auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      try {
        const data = await response.json();
        return thunkAPI.rejectWithValue(data.message || data.error || 'Registration failed');
      } catch {
        const text = await response.text();
        return thunkAPI.rejectWithValue(text || 'Registration failed');
      }
    }

    const data = await response.json();
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    await SecureStore.setItemAsync('accessToken', data.accessToken);
    return data;
  }
);

// Template async thunk for future use
export const refreshAccessTokenAsync = createAsyncThunk<
  {accessToken: string; accessTokenExpiresAt: string},
  void,
  {state: RootState; rejectValue: string}
>('auth/refreshAccessToken', async (_, {getState, rejectWithValue}) => {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');

  const response = await fetch(`${backendApi}/api/Auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshToken,
    }),
  });

  if (!response.ok) {
    try {
      const data = await response.json();
      return rejectWithValue(data.message || data.error || 'Failed to refresh token');
    } catch {
      const text = await response.text();
      return rejectWithValue(text || 'Failed to refresh token');
    }
  }

  const data = await response.json();
  await SecureStore.setItemAsync('accessToken', data.accessToken);
  return {
    accessToken: data.accessToken,
    accessTokenExpiresAt: data.accessTokenExpiresAt,
  };
});

// Template async thunk for login
export const loginAsync = createAsyncThunk<
  {accessToken: string; accessTokenExpiresAt: string; refreshToken: string; refreshTokenExpiresAt: string},
  {identifier: string; password: string},
  {state: RootState; rejectValue: string}
>('auth/login', async (credentials, thunkAPI) => {
  const response = await fetch(`${backendApi}/api/Auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    try {
      const data = await response.json();
      return thunkAPI.rejectWithValue(data.message || data.error || 'Login failed');
    } catch {
      const text = await response.text();
      return thunkAPI.rejectWithValue(text || 'Login failed');
    }
  }

  const data = await response.json();
  
  // TODO: Save tokens to AsyncStorage
  await SecureStore.setItemAsync('refreshToken', data.refreshToken);
  await SecureStore.setItemAsync('accessToken', data.accessToken);
  
  return data;
});

// Add a thunk to read tokens from SecureStore
export const initializeAuthAsync = createAsyncThunk<
  {accessToken: string; refreshToken: string},
  void,
  {state: RootState}
>('auth/initializeAuth', async () => {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  const refreshToken = await SecureStore.getItemAsync('refreshToken');

  if (!accessToken || !refreshToken) {
    throw new Error('No tokens found');
  }

  return { accessToken, refreshToken };
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    setAccessToken: (state, action: PayloadAction<{token: string; expiresAt: string}>) => {
      state.accessToken = action.payload.token;
      state.accessTokenExpiresAt = action.payload.expiresAt;
      state.isAuthenticated = true;
    },
    setRefreshToken: (state, action: PayloadAction<{token: string; expiresAt: string}>) => {
      state.refreshToken = action.payload.token;
      state.refreshTokenExpiresAt = action.payload.expiresAt;
    },
    setTokens: (state, action: PayloadAction<{
      accessToken: string;
      accessTokenExpiresAt: string;
      refreshToken: string;
      refreshTokenExpiresAt: string;
    }>) => {
      state.accessToken = action.payload.accessToken;
      state.accessTokenExpiresAt = action.payload.accessTokenExpiresAt;
      state.refreshToken = action.payload.refreshToken;
      state.refreshTokenExpiresAt = action.payload.refreshTokenExpiresAt;
      state.isAuthenticated = true;
    },
    clearTokens: (state) => {
      state.accessToken = null;
      state.accessTokenExpiresAt = null;
      state.refreshToken = null;
      state.refreshTokenExpiresAt = null;
      state.isAuthenticated = false;
      SecureStore.deleteItemAsync('accessToken');
      SecureStore.deleteItemAsync('refreshToken');
    },
    logOut: (state) => {
      console.log("Logging out, clearing tokens");
      state.accessToken = null;
      state.accessTokenExpiresAt = null;
      state.refreshToken = null;
      state.refreshTokenExpiresAt = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(forgotPasswordAsync.pending, (state) => {
        state.status = 'loading';
        // Keep existing error until shown by AlertComponent
      })
      .addCase(forgotPasswordAsync.fulfilled, (state) => {
        state.status = 'idle';
        state.error = null;
      })
      .addCase(forgotPasswordAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || action.error.message || 'Failed to send reset link';
      })
      .addCase(registerAsync.pending, (state) => {
        state.status = 'loading';
        // Keep existing error until shown by AlertComponent
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.accessToken = action.payload.accessToken;
        state.accessTokenExpiresAt = action.payload.accessTokenExpiresAt;
        state.refreshToken = action.payload.refreshToken;
        state.refreshTokenExpiresAt = action.payload.refreshTokenExpiresAt;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.error = (action.payload as string) || action.error.message || 'Registration failed';
      })
      .addCase(refreshAccessTokenAsync.pending, (state) => {
        state.status = 'loading';
        // Keep existing error until shown by AlertComponent
      })
      .addCase(refreshAccessTokenAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.accessToken = action.payload.accessToken;
        state.accessTokenExpiresAt = action.payload.accessTokenExpiresAt;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshAccessTokenAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.accessToken = null;
        state.accessTokenExpiresAt = null;
        state.isAuthenticated = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to refresh token';
      })
      .addCase(loginAsync.pending, (state) => {
        state.status = 'loading';
        // Keep existing error until shown by AlertComponent
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.accessToken = action.payload.accessToken;
        state.accessTokenExpiresAt = action.payload.accessTokenExpiresAt;
        state.refreshToken = action.payload.refreshToken;
        state.refreshTokenExpiresAt = action.payload.refreshTokenExpiresAt;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.error = (action.payload as string) || action.error.message || 'Login failed';
      })
      .addCase(initializeAuthAsync.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(initializeAuthAsync.rejected, (state) => {
        state.isAuthenticated = false;
      });
  },
});

export const {
  clearAuthError,
  setAccessToken,
  setRefreshToken,
  setTokens,
  clearTokens,
  setAuthenticated,
  logOut,
} = authSlice.actions;

// Selectors
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAccessTokenExpiresAt = (state: RootState) => state.auth.accessTokenExpiresAt;
export const selectRefreshTokenExpiresAt = (state: RootState) => state.auth.refreshTokenExpiresAt;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
