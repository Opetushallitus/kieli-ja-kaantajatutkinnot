import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkEnrollmentContact } from 'interfaces/clerkEnrollment';

interface ClerkEnrollmentContactRequestState {
  status: APIResponseStatus;
  deleteStatus: APIResponseStatus;
  enrollment?: ClerkEnrollmentContact;
  createStatus: APIResponseStatus;
}

const initialState: ClerkEnrollmentContactRequestState = {
  status: APIResponseStatus.NotStarted,
  createStatus: APIResponseStatus.NotStarted,
  deleteStatus: APIResponseStatus.NotStarted,
};

const clerkEnrollmentContactRequestSlice = createSlice({
  name: 'clerkEnrollmentContactRequest',
  initialState,
  reducers: {
    loadClerkEnrollmentContactRequest(
      state,
      _action: PayloadAction<{
        id: number;
        oid: string;
      }>,
    ) {
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
    createClerkEnrollmentAppointment(
      state,
      _action: PayloadAction<{
        id: number;
        oid: string;
      }>,
    ) {
      state.createStatus = APIResponseStatus.InProgress;
    },
    storeCreateClerkEnrollmentAppointment(
      state,
      _action: PayloadAction<ClerkEnrollmentContact>,
    ) {
      state.createStatus = APIResponseStatus.Success;
    },
    rejectCreateClerkEnrollmentAppointment(state) {
      state.createStatus = APIResponseStatus.Error;
    },
    resetClerkEnrollmentContactRequestToInitialState(_state) {
      return initialState;
    },
    deleteClerkEnrollmentContactRequest(
      state,
      _action: PayloadAction<{
        id: number;
        oid: string;
      }>,
    ) {
      state.deleteStatus = APIResponseStatus.InProgress;
    },
    storeDeleteClerkEnrollmentContactRequest(state) {
      state.deleteStatus = APIResponseStatus.Success;
    },
  },
});

export const clerkEnrollmentContactRequestReducer =
  clerkEnrollmentContactRequestSlice.reducer;
export const {
  rejectClerkEnrollmentContactRequest,
  storeClerkEnrollmentContactRequest,
  loadClerkEnrollmentContactRequest,
  createClerkEnrollmentAppointment,
  storeCreateClerkEnrollmentAppointment,
  rejectCreateClerkEnrollmentAppointment,
  resetClerkEnrollmentContactRequestToInitialState,
  deleteClerkEnrollmentContactRequest,
  storeDeleteClerkEnrollmentContactRequest,
} = clerkEnrollmentContactRequestSlice.actions;
