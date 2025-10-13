import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkFreeRegistrationDetails } from 'interfaces/clerkFreeRegistration';

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
  registrationDetails: ClerkFreeRegistrationDetails | null;
  status: APIResponseStatus;
  registrationApprovalStatus: FreeRegistrationApprovalStatus;
}

const initialState: ClerkFreeRegistrationState = {
  registrationDetails: null,
  status: APIResponseStatus.NotStarted,
  registrationApprovalStatus: FreeRegistrationApprovalStatus.NotStarted,
};

const clerkFreeRegistrationDetailsSlice = createSlice({
  name: 'clerkFreeRegistrationDetails',
  initialState,
  reducers: {
    loadClerkFreeRegistrationDetails(state, _action: PayloadAction<number>) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectClerkFreeRegistrationDetails(state) {
      state.status = APIResponseStatus.Error;
    },
    storeClerkFreeRegistrationDetails(
      state,
      action: PayloadAction<ClerkFreeRegistrationDetails>,
    ) {
      state.status = APIResponseStatus.Success;
      state.registrationDetails = action.payload;
    },
    resetClerkFreeRegistrationDetails(state) {
      state.status = APIResponseStatus.NotStarted;
      state.registrationDetails = null;
    },
    setFreeRegistrationStatus(
      state,
      action: PayloadAction<FreeRegistrationApprovalStatus>,
    ) {
      state.registrationApprovalStatus = action.payload;
    },
    approveFreeRegistration(state, _action: PayloadAction<number>) {
      state.registrationApprovalStatus =
        FreeRegistrationApprovalStatus.ApprovalInProgress;
    },
    rejectFreeRegistration(state, _action: PayloadAction<number>) {
      state.registrationApprovalStatus =
        FreeRegistrationApprovalStatus.RejectInProgress;
    },
  },
});

export const clerkFreeRegistrationDetailsReducer =
  clerkFreeRegistrationDetailsSlice.reducer;
export const {
  loadClerkFreeRegistrationDetails,
  rejectClerkFreeRegistrationDetails,
  storeClerkFreeRegistrationDetails,
  resetClerkFreeRegistrationDetails,
  setFreeRegistrationStatus,
  approveFreeRegistration,
  rejectFreeRegistration,
} = clerkFreeRegistrationDetailsSlice.actions;
