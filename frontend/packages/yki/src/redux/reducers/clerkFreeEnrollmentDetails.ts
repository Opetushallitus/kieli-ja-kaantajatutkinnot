import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkFreeEnrollmentDetails } from 'interfaces/clerkFreeEnrollment';

interface ClerkFreeEnrollmentState {
  enrollmentDetails: ClerkFreeEnrollmentDetails | null;
  status: APIResponseStatus;
}

const initialState: ClerkFreeEnrollmentState = {
  enrollmentDetails: null,
  status: APIResponseStatus.NotStarted,
};

const clerkFreeEnrollmentDetailsSlice = createSlice({
  name: 'clerkFreeEnrollmentDetails',
  initialState,
  reducers: {
    loadClerkFreeEnrollmentDetails(state, _action: PayloadAction<number>) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectClerkFreeEnrollmentDetails(state) {
      state.status = APIResponseStatus.Error;
    },
    storeClerkFreeEnrollmentDetails(
      state,
      action: PayloadAction<ClerkFreeEnrollmentDetails>,
    ) {
      state.status = APIResponseStatus.Success;
      state.enrollmentDetails = action.payload;
    },
  },
});

export const clerkFreeEnrollmentDetailsReducer =
  clerkFreeEnrollmentDetailsSlice.reducer;
export const {
  loadClerkFreeEnrollmentDetails,
  rejectClerkFreeEnrollmentDetails,
  storeClerkFreeEnrollmentDetails,
} = clerkFreeEnrollmentDetailsSlice.actions;
