import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SessionState {
  sessionCookie?: string;
}

const initialState: SessionState = {};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSessionCookie(state, action: PayloadAction<string>) {
      state.sessionCookie = action.payload;
    },
  },
});

export const sessionReducer = sessionSlice.reducer;
export const { setSessionCookie } = sessionSlice.actions;
