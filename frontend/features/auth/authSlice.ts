import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';

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

// Template async thunk for future use
export const refreshAccessTokenAsync = createAsyncThunk<
  {accessToken: string; accessTokenExpiresAt: string},
  void,
  {state: RootState}
>('auth/refreshAccessToken', async (_, {getState}) => {
  const {auth} = getState();
  
  // TODO: Get refresh token from AsyncStorage
  // const refreshToken = await AsyncStorage.getItem('refreshToken');
  console.log("backendApi", backendApi);
  
  const response = await fetch(`${backendApi}/api/Auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshToken: auth.refreshToken, // In real implementation, get from AsyncStorage
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  
  // TODO: Save new access token to AsyncStorage if needed
  // await AsyncStorage.setItem('accessToken', data.accessToken);
  
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
  // await AsyncStorage.setItem('refreshToken', data.refreshToken);
  // await AsyncStorage.setItem('accessToken', data.accessToken);
  
  return data;
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
      // TODO: Clear tokens from AsyncStorage
      // AsyncStorage.removeItem('accessToken');
      // AsyncStorage.removeItem('refreshToken');
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export const {
  setAccessToken,
  setRefreshToken,
  setTokens,
  clearTokens,
  setAuthenticated,
} = authSlice.actions;

// Selectors
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAccessTokenExpiresAt = (state: RootState) => state.auth.accessTokenExpiresAt;
export const selectRefreshTokenExpiresAt = (state: RootState) => state.auth.refreshTokenExpiresAt;
export const selectAuthStatus = (state: RootState) => state.auth.status;

export default authSlice.reducer;