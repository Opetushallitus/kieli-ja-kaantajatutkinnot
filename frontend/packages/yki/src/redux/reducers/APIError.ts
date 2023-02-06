import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { APIErrorState } from 'interfaces/APIError';

const initialState: APIErrorState = {};

const APIErrorSlice = createSlice({
  name: 'APIError',
  initialState,
  reducers: {
    setAPIError(state, action: PayloadAction<string>) {
      state.message = action.payload;
    },
    resetAPIError(state) {
      state.message = initialState.message;
    },
  },
});

export const APIErrorReducer = APIErrorSlice.reducer;
export const { setAPIError, resetAPIError } = APIErrorSlice.actions;
