import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import * as Localization from 'expo-localization';
import { storage } from '../../utils/storage';

const backendApi = process.env.EXPO_PUBLIC_API_URL || '';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number; // Changed from Date to number
}

interface ChatbotState {
  messages: Message[];
  sessionId: string;
  userId: string;
  language: string;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

// Generate UUID for session/user
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Get user's system language or fallback to Romanian
const getUserLanguage = (): string => {
  try {
    const locale = Localization.getLocales()[0]?.languageCode;
    return locale || 'ro';
  } catch {
    return 'ro';
  }
};

const initialState: ChatbotState = {
  messages: [],
  sessionId: generateUUID(),
  userId: generateUUID(),
  language: getUserLanguage(),
  status: 'idle',
  error: null,
};

// Async thunk for sending chat message
export const sendChatMessageAsync = createAsyncThunk<
  { sessionId: string; reply: string },
  { message: string },
  { state: RootState; rejectValue: string }
>(
  'chatbot/sendMessage',
  async (payload, thunkAPI) => {
    const state = thunkAPI.getState();
    const { sessionId, userId, language } = state.chatbot;
    const accessToken = await storage.getItem('accessToken');

    const requestBody = {
      language,
      userId,
      message: payload.message,
      sessionId,
    };

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(`${backendApi}/api/Chatbot/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log("response", response);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to send message. Try logging in again';

        if (contentType && contentType.includes('application/json')) {
          try {
            const data = await response.json();
            errorMessage = data.message || data.error || errorMessage;
          } catch (e) {
            console.error('Failed to parse error JSON:', e);
          }
        } else {
          try {
            const text = await response.text();
            errorMessage = text || errorMessage;
          } catch (e) {
            console.error('Failed to read error text:', e);
          }
        }

        return thunkAPI.rejectWithValue(errorMessage);
      }

      const data = await response.json();
      return {
        sessionId: data.sessionId || sessionId,
        reply: data.reply || 'No response received',
      };
    } catch (error) {
      console.error('Chatbot request error:', error);
      return thunkAPI.rejectWithValue(
        error instanceof Error ? error.message : 'Network error occurred'
      );
    }
  }
);

export const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      const newMessage: Message = {
        id: generateUUID(),
        text: action.payload,
        sender: 'user',
        timestamp: Date.now(), // Changed to Date.now()
      };
      state.messages.push(newMessage);
    },
    addBotMessage: (state, action: PayloadAction<string>) => {
      const newMessage: Message = {
        id: generateUUID(),
        text: action.payload,
        sender: 'bot',
        timestamp: Date.now(), // Changed to Date.now()
      };
      state.messages.push(newMessage);
    },
    clearMessages: (state) => {
      state.messages = [];
      state.sessionId = generateUUID();
      state.userId = generateUUID();
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessageAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(sendChatMessageAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.error = null;
        // Add bot's reply to messages
        const botMessage: Message = {
          id: generateUUID(),
          text: action.payload.reply,
          sender: 'bot',
          timestamp: Date.now(), // Changed to Date.now()
        };
        state.messages.push(botMessage);
        // Update sessionId if backend returns a different one
        if (action.payload.sessionId) {
          state.sessionId = action.payload.sessionId;
        }
      })
      .addCase(sendChatMessageAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || action.error.message || 'Failed to send message. Try logging in again';
      });
  },
});

export const {
  addUserMessage,
  addBotMessage,
  clearMessages,
  clearError,
  setLanguage,
} = chatbotSlice.actions;

// Selectors
export const selectMessages = (state: RootState) => state.chatbot.messages;
export const selectSessionId = (state: RootState) => state.chatbot.sessionId;
export const selectUserId = (state: RootState) => state.chatbot.userId;
export const selectLanguage = (state: RootState) => state.chatbot.language;
export const selectChatbotStatus = (state: RootState) => state.chatbot.status;
export const selectChatbotError = (state: RootState) => state.chatbot.error;

export default chatbotSlice.reducer;