import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkEnrollmentContact } from 'interfaces/clerkEnrollment';

interface ClerkEnrollmentContactRequestState {
  status: APIResponseStatus;
  enrollment?: ClerkEnrollmentContact;
  createStatus: APIResponseStatus;
}

const initialState: ClerkEnrollmentContactRequestState = {
  status: APIResponseStatus.NotStarted,
  createStatus: APIResponseStatus.NotStarted,
};

const clerkEnrollmentContactRequestSlice = createSlice({
  name: 'clerkEnrollmentContactRequest',
  initialState,
  reducers: {
    loadClerkEnrollmentContactRequest(state, _action: PayloadAction<number>) {
      state.status = APIResponseStatus.InProgress;
    },
    storeClerkEnrollmentContactRequest(
      state,
      action: PayloadAction<ClerkEnrollmentContact>,
    ) {
      state.enrollment = action.payload;
      state.status = APIResponseStatus.Success;
    },
    rejectClerkEnrollmentContactRequest(state) {
      state.status = APIResponseStatus.Error;
    },
    createClerkEnrollmentAppointment(state, _action: PayloadAction<number>) {
      state.createStatus = APIResponseStatus.InProgress;
    },
  },
});

export const clerkEnrollmentContactRequestReducer =
  clerkEnrollmentContactRequestSlice.reducer;
export const {
  rejectClerkEnrollmentContactRequest,
  storeClerkEnrollmentContactRequest,
  loadClerkEnrollmentContactRequest,
} = clerkEnrollmentContactRequestSlice.actions;
