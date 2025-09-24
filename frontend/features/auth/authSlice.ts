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
}

const initialState: AuthState = {
  accessToken: null,
  accessTokenExpiresAt: null,
  refreshToken: null,
  refreshTokenExpiresAt: null,
  isAuthenticated: false,
  status: 'idle',
};

// Async thunk for forgot password
export const forgotPasswordAsync = createAsyncThunk<
  {message: string},
  {email: string},
  {state: RootState}
>(
  'auth/forgotPassword',
  async (payload) => {
    const response = await fetch(`${backendApi}/api/Auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to send reset link');
    }

    const data = await response.json();
    return data;
  }
);

// Async thunk for registration
export const registerAsync = createAsyncThunk<
  {accessToken: string; accessTokenExpiresAt: string; refreshToken: string; refreshTokenExpiresAt: string},
  any,
  {state: RootState}
>(
  'auth/register',
  async (registerData) => {
    const response = await fetch(`${backendApi}/api/Auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
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
  {state: RootState}
>('auth/refreshAccessToken', async (_, {getState}) => {
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
    throw new Error('Failed to refresh token');
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
  {state: RootState}
>('auth/login', async (credentials) => {
  const response = await fetch(`${backendApi}/api/Auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Login failed');
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
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(forgotPasswordAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(forgotPasswordAsync.fulfilled, (state) => {
        state.status = 'idle';
      })
      .addCase(forgotPasswordAsync.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(registerAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.accessToken = action.payload.accessToken;
        state.accessTokenExpiresAt = action.payload.accessTokenExpiresAt;
        state.refreshToken = action.payload.refreshToken;
        state.refreshTokenExpiresAt = action.payload.refreshTokenExpiresAt;
        state.isAuthenticated = true;
      })
      .addCase(registerAsync.rejected, (state) => {
        state.status = 'failed';
        state.isAuthenticated = false;
      })
      .addCase(refreshAccessTokenAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(refreshAccessTokenAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.accessToken = action.payload.accessToken;
        state.accessTokenExpiresAt = action.payload.accessTokenExpiresAt;
        state.isAuthenticated = true;
      })
      .addCase(refreshAccessTokenAsync.rejected, (state) => {
        state.status = 'failed';
        state.accessToken = null;
        state.accessTokenExpiresAt = null;
        state.isAuthenticated = false;
      })
      .addCase(loginAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.accessToken = action.payload.accessToken;
        state.accessTokenExpiresAt = action.payload.accessTokenExpiresAt;
        state.refreshToken = action.payload.refreshToken;
        state.refreshTokenExpiresAt = action.payload.refreshTokenExpiresAt;
        state.isAuthenticated = true;
      })
      .addCase(loginAsync.rejected, (state) => {
        state.status = 'failed';
        state.isAuthenticated = false;
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

export default authSlice.reducer;
