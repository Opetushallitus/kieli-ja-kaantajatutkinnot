import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkExamSession,
  ClerkExamSessionResponse,
} from 'interfaces/clerkExamSession';

export interface ClerkExamSessionEditForm {
  language: string;
  level: string;
  maxParticipantsTotal: string;
  maxParticipantsPartial1: string;
  maxParticipantsPartial2: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  contactName: string;
  contactEmail: string;
  contactPhoneNumber: string;
}

interface ClerkExamSessionState {
  clerkExamSession: ClerkExamSession | null;
  status: APIResponseStatus;
  updateStatus: APIResponseStatus;
  relocateExamSessions: ClerkExamSessionResponse[];
  relocateExamSessionsStatus: APIResponseStatus;
  relocateStatus: APIResponseStatus;
  cancelStatus: APIResponseStatus;
}

const initialState: ClerkExamSessionState = {
  clerkExamSession: null,
  status: APIResponseStatus.NotStarted,
  updateStatus: APIResponseStatus.NotStarted,
  relocateExamSessions: [],
  relocateExamSessionsStatus: APIResponseStatus.NotStarted,
  relocateStatus: APIResponseStatus.NotStarted,
  cancelStatus: APIResponseStatus.NotStarted,
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
    loadRelocateExamSessions(
      state,
      _action: PayloadAction<{ language: string; level: string }>,
    ) {
      state.relocateExamSessionsStatus = APIResponseStatus.InProgress;
    },
    storeRelocateExamSessions(
      state,
      action: PayloadAction<ClerkExamSessionResponse[]>,
    ) {
      state.relocateExamSessionsStatus = APIResponseStatus.Success;
      state.relocateExamSessions = action.payload;
    },
    rejectRelocateExamSessions(state) {
      state.relocateExamSessionsStatus = APIResponseStatus.Error;
    },
    relocateRegistration(
      state,
      _action: PayloadAction<{
        registrationId: number;
        targetExamSessionId: number;
        currentExamSessionId: number;
      }>,
    ) {
      state.relocateStatus = APIResponseStatus.InProgress;
    },
    acceptRelocateRegistration(state) {
      state.relocateStatus = APIResponseStatus.Success;
    },
    rejectRelocateRegistration(state) {
      state.relocateStatus = APIResponseStatus.Error;
    },
    resetRelocate(state) {
      state.relocateExamSessions = [];
      state.relocateExamSessionsStatus = APIResponseStatus.NotStarted;
      state.relocateStatus = APIResponseStatus.NotStarted;
    },
    cancelRegistration(
      state,
      _action: PayloadAction<{
        registrationId: number;
        currentExamSessionId: number;
      }>,
    ) {
      state.cancelStatus = APIResponseStatus.InProgress;
    },
    acceptCancelRegistration(state) {
      state.cancelStatus = APIResponseStatus.Success;
    },
    rejectCancelRegistration(state) {
      state.cancelStatus = APIResponseStatus.Error;
    },
    resetCancel(state) {
      state.cancelStatus = APIResponseStatus.NotStarted;
    },
    resetClerkExamSession() {
      return initialState;
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
  loadRelocateExamSessions,
  storeRelocateExamSessions,
  rejectRelocateExamSessions,
  relocateRegistration,
  acceptRelocateRegistration,
  rejectRelocateRegistration,
  resetRelocate,
  cancelRegistration,
  acceptCancelRegistration,
  rejectCancelRegistration,
  resetCancel,
  resetClerkExamSession,
} = clerkExamSessionSlice.actions;
