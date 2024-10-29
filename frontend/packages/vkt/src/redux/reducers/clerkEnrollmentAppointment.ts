import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkEnrollmentAppointment } from 'interfaces/clerkEnrollment';

interface ClerkEnrollmentAppointmentState {
  status: APIResponseStatus;
  enrollment?: ClerkEnrollmentAppointment;
  createStatus: APIResponseStatus;
}

const initialState: ClerkEnrollmentAppointmentState = {
  status: APIResponseStatus.NotStarted,
  createStatus: APIResponseStatus.NotStarted,
};

const clerkEnrollmentAppointmentSlice = createSlice({
  name: 'clerkEnrollmentAppointment',
  initialState,
  reducers: {
    loadClerkEnrollmentAppointment(state, _action: PayloadAction<number>) {
      state.status = APIResponseStatus.InProgress;
    },
    storeClerkEnrollmentAppointment(
      state,
      action: PayloadAction<ClerkEnrollmentAppointment>,
    ) {
      state.enrollment = action.payload;
      state.status = APIResponseStatus.Success;
    },
    rejectClerkEnrollmentAppointment(state) {
      state.status = APIResponseStatus.Error;
    },
  },
});

export const clerkEnrollmentAppointmentReducer =
  clerkEnrollmentAppointmentSlice.reducer;
export const {
  rejectClerkEnrollmentAppointment,
  storeClerkEnrollmentAppointment,
  loadClerkEnrollmentAppointment,
} = clerkEnrollmentAppointmentSlice.actions;
