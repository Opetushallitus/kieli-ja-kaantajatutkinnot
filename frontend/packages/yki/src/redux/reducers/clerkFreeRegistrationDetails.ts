import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkFreeRegistrationDetails } from 'interfaces/clerkFreeRegistration';

enum FreeRegistrationApprovalStatus {
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
  commentStatus: APIResponseStatus;
}

const initialState: ClerkFreeRegistrationState = {
  registrationDetails: null,
  status: APIResponseStatus.NotStarted,
  registrationApprovalStatus: FreeRegistrationApprovalStatus.NotStarted,
  commentStatus: APIResponseStatus.NotStarted,
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
    addComment(
      state,
      _action: PayloadAction<{ freeRegistrationId: number; comment: string }>,
    ) {
      state.commentStatus = APIResponseStatus.InProgress;
    },
    rejectAddComment(state) {
      state.commentStatus = APIResponseStatus.Error;
    },
    acceptAddComment(state) {
      state.commentStatus = APIResponseStatus.Success;
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
  addComment,
  rejectAddComment,
  acceptAddComment,
} = clerkFreeRegistrationDetailsSlice.actions;
