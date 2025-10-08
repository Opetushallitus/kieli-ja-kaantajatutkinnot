import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkFreeRegistration } from 'interfaces/clerkFreeRegistration';

export enum FreeRegistrationApprovalStatus {
  NotStarted,
  ApprovalInProgress,
  ApprovalSuccess,
  ApprovalError,
  RejectInProgress,
  RejectSuccess,
  RejectError,
}

interface ClerkFreeRegistrationState {
  freeRegistrations: Array<ClerkFreeRegistration>;
  status: APIResponseStatus;
  registrationApprovalStatus: FreeRegistrationApprovalStatus;
}

const initialState: ClerkFreeRegistrationState = {
  freeRegistrations: [],
  status: APIResponseStatus.NotStarted,
  registrationApprovalStatus: FreeRegistrationApprovalStatus.NotStarted,
};

const clerkFreeRegistrationSlice = createSlice({
  name: 'clerkFreeRegistration',
  initialState,
  reducers: {
    loadClerkFreeRegistrations(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectClerkFreeRegistrations(state) {
      state.status = APIResponseStatus.Error;
    },
    storeClerkFreeRegistrations(
      state,
      action: PayloadAction<Array<ClerkFreeRegistration>>,
    ) {
      state.status = APIResponseStatus.Success;
      state.freeRegistrations = action.payload;
    },

    setFreeRegistrationStatus(
      state,
      action: PayloadAction<FreeRegistrationApprovalStatus>,
    ) {
      state.registrationApprovalStatus = action.payload;
    },
    approveFreeRegistration(state) {
      state.registrationApprovalStatus =
        FreeRegistrationApprovalStatus.ApprovalInProgress;
    },
    rejectFreeRegistration(state) {
      state.registrationApprovalStatus =
        FreeRegistrationApprovalStatus.RejectInProgress;
    },
  },
});

export const clerkFreeRegistrationReducer = clerkFreeRegistrationSlice.reducer;
export const {
  loadClerkFreeRegistrations,
  rejectClerkFreeRegistrations,
  storeClerkFreeRegistrations,
  setFreeRegistrationStatus,
  approveFreeRegistration,
  rejectFreeRegistration,
} = clerkFreeRegistrationSlice.actions;
