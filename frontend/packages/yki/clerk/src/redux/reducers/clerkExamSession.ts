import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkExamSession } from 'interfaces/clerkExamSession';

export interface ClerkExamSessionEditForm {
  maxParticipants: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  contactInfo: string;
}

interface ClerkExamSessionState {
  clerkExamSession: ClerkExamSession | null;
  status: APIResponseStatus;
  updateStatus: APIResponseStatus;
}

const initialState: ClerkExamSessionState = {
  clerkExamSession: null,
  status: APIResponseStatus.NotStarted,
  updateStatus: APIResponseStatus.NotStarted,
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
    saveExamSession(
      state,
      _action: PayloadAction<{
        examSessionId: number;
        form: ClerkExamSessionEditForm;
      }>,
    ) {
      state.updateStatus = APIResponseStatus.InProgress;
    },
    acceptSaveExamSession(state, action: PayloadAction<ClerkExamSession>) {
      state.updateStatus = APIResponseStatus.Success;
      state.clerkExamSession = action.payload;
    },
    rejectSaveExamSession(state) {
      state.updateStatus = APIResponseStatus.Error;
    },
  },
});

export const clerkExamSessionReducer = clerkExamSessionSlice.reducer;
export const {
  loadClerkExamSessionDetails,
  rejectExamSessionDetails,
  storeExamSessionDetails,
  saveExamSession,
  acceptSaveExamSession,
  rejectSaveExamSession,
} = clerkExamSessionSlice.actions;
