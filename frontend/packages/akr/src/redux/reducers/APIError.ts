import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { APIErrorState } from 'interfaces/APIError';

const initialState: APIErrorState = {};

const APIErrorSlice = createSlice({
  name: 'APIError',
  initialState,
  reducers: {
    setAPIError(state, action: PayloadAction<string>) {
      state.currentError = action.payload;
    },
    clearAPIError(state) {
      state.currentError = initialState.currentError;
    },
  },
});

export const APIErrorReducer = APIErrorSlice.reducer;
export const { setAPIError, clearAPIError } = APIErrorSlice.actions;
