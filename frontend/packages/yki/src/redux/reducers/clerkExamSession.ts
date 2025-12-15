import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkExamSessionDetails } from 'interfaces/clerkExamSession';

interface ClerkExamSessionState {
  examSessionDetails: ClerkExamSessionDetails | null;
  status: APIResponseStatus;
}

const initialState: ClerkExamSessionState = {
  examSessionDetails: null,
  status: APIResponseStatus.NotStarted,
};

const clerkExamSessionSlice = createSlice({
  name: 'examSessionDetails',
  initialState,
  reducers: {
    loadClerkExamSessionDetails(state, _action: PayloadAction<number>) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectExamSessionDetails(state) {
      state.status = APIResponseStatus.Error;
    },
    storeExamSessionDetails(state, action: PayloadAction<ClerkExamSessionDetails>) {
      state.status = APIResponseStatus.Success;
      state.ExamSessionDetails = action.payload;
    },
  },
});

export const clerkExamSessionReducer = clerkExamSessionSlice.reducer;
export const {
  loadClerkExamSessionDetails,
  rejectExamSessionDetails,
  storeExamSessionDetails,
} = clerkExamSessionSlice.actions;
