import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkExamSession } from 'interfaces/clerkExamSession';

interface ClerkExamSessionState {
  clerkExamSession: ClerkExamSession | null;
  status: APIResponseStatus;
}

const initialState: ClerkExamSessionState = {
  clerkExamSession: null,
  status: APIResponseStatus.NotStarted,
};

const clerkExamSessionSlice = createSlice({
  name: 'clerkExamSession',
  initialState,
  reducers: {
    loadClerkExamSessionDetails(state, _action: PayloadAction<number>) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectExamSessionDetails(state) {
      state.status = APIResponseStatus.Error;
    },
    storeExamSessionDetails(state, action: PayloadAction<ClerkExamSession>) {
      state.status = APIResponseStatus.Success;
      state.clerkExamSession = action.payload;
    },
  },
});

export const clerkExamSessionReducer = clerkExamSessionSlice.reducer;
export const {
  loadClerkExamSessionDetails,
  rejectExamSessionDetails,
  storeExamSessionDetails,
} = clerkExamSessionSlice.actions;
