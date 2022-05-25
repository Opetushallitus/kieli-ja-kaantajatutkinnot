import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkInterpreter,
  ClerkInterpreterState,
} from 'interfaces/clerkInterpreter';

const initialState: ClerkInterpreterState = {
  interpreters: [],
  status: APIResponseStatus.NotStarted,
};

const clerkInterpreterSlice = createSlice({
  name: 'clerkInterpreter',
  initialState,
  reducers: {
    loadClerkInterpreters(state) {
      state.status = APIResponseStatus.InProgress;
    },
    storeClerkInterpreters(
      state,
      action: PayloadAction<Array<ClerkInterpreter>>
    ) {
      state.status = APIResponseStatus.Success;
      state.interpreters = action.payload;
    },
    loadingClerkInterpretersFailed(state) {
      state.status = APIResponseStatus.Error;
    },
  },
});

export const clerkInterpreterReducer = clerkInterpreterSlice.reducer;
export const {
  loadClerkInterpreters,
  storeClerkInterpreters,
  loadingClerkInterpretersFailed,
} = clerkInterpreterSlice.actions;
