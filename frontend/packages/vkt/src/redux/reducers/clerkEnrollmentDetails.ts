import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkEnrollment, ClerkExamEvent } from 'interfaces/clerkExamEvent';

interface ClerkEnrollmentDetailsState {
  status: APIResponseStatus;
  enrollment?: ClerkEnrollment;
}

const initialState: ClerkEnrollmentDetailsState = {
  status: APIResponseStatus.NotStarted,
};

const clerkEnrollmentDetailsSlice = createSlice({
  name: 'clerkEnrollmentDetails',
  initialState,
  reducers: {
    storeClerkEnrollmentDetails(state, action: PayloadAction<ClerkEnrollment>) {
      state.enrollment = action.payload;
    },
    resetClerkEnrollmentDetailsUpdate(state) {
      state.status = initialState.status;
    },
    updateClerkEnrollmentDetails(
      state,
      _action: PayloadAction<{
        enrollment: ClerkEnrollment;
        examEvent?: ClerkExamEvent;
      }>
    ) {
      state.status = APIResponseStatus.InProgress;
    },
    storeClerkEnrollmentDetailsUpdate(
      state,
      action: PayloadAction<ClerkEnrollment>
    ) {
      state.status = APIResponseStatus.Success;
      state.enrollment = action.payload;
    },
    rejectClerkEnrollmentDetailsUpdate(state) {
      state.status = APIResponseStatus.Error;
    },
  },
});

export const clerkEnrollmentDetailsReducer =
  clerkEnrollmentDetailsSlice.reducer;
export const {
  storeClerkEnrollmentDetails,
  resetClerkEnrollmentDetailsUpdate,
  updateClerkEnrollmentDetails,
  storeClerkEnrollmentDetailsUpdate,
  rejectClerkEnrollmentDetailsUpdate,
} = clerkEnrollmentDetailsSlice.actions;
