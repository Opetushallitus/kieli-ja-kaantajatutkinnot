import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkEnrollment,
  ClerkEnrollmentMove,
  ClerkPaymentLink,
} from 'interfaces/clerkEnrollment';
import { ClerkExamEvent } from 'interfaces/clerkExamEvent';

interface ClerkEnrollmentDetailsState {
  status: APIResponseStatus;
  moveStatus: APIResponseStatus;
  enrollment?: ClerkEnrollment;
  paymentLink?: ClerkPaymentLink;
}

const initialState: ClerkEnrollmentDetailsState = {
  status: APIResponseStatus.NotStarted,
  moveStatus: APIResponseStatus.NotStarted,
};

const clerkEnrollmentDetailsSlice = createSlice({
  name: 'clerkEnrollmentDetails',
  initialState,
  reducers: {
    storeClerkEnrollmentDetails(state, action: PayloadAction<ClerkEnrollment>) {
      state.enrollment = action.payload;
      state.paymentLink = initialState.paymentLink;
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
    createClerkEnrollmentPaymentLink(
      state,
      _action: PayloadAction<ClerkEnrollment>
    ) {
      state.status = APIResponseStatus.InProgress;
    },
    storeClerkEnrollmentPaymentLink(
      state,
      action: PayloadAction<ClerkPaymentLink>
    ) {
      state.status = APIResponseStatus.Success;
      state.paymentLink = action.payload;
    },
    moveEnrollment(state, _action: PayloadAction<ClerkEnrollmentMove>) {
      state.moveStatus = APIResponseStatus.InProgress;
    },
    moveEnrollmentSucceeded(state) {
      state.moveStatus = APIResponseStatus.Success;
    },
    rejectMoveEnrollment(state) {
      state.moveStatus = APIResponseStatus.Error;
    },
    resetMoveEnrollment(state) {
      state.moveStatus = initialState.moveStatus;
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
  createClerkEnrollmentPaymentLink,
  storeClerkEnrollmentPaymentLink,
  moveEnrollment,
  moveEnrollmentSucceeded,
  rejectMoveEnrollment,
  resetMoveEnrollment,
} = clerkEnrollmentDetailsSlice.actions;
