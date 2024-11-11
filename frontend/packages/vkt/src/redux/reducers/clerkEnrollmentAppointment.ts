import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkEnrollmentAppointment,
  ClerkEnrollmentAppointmentGrades,
} from 'interfaces/clerkEnrollment';
import { ClerkExamEvent } from 'interfaces/clerkExamEvent';

interface ClerkEnrollmentAppointmentState {
  status: APIResponseStatus;
  enrollment?: ClerkEnrollmentAppointment;
  createStatus: APIResponseStatus;
  gradesStatus: APIResponseStatus;
  grades?: ClerkEnrollmentAppointmentGrades;
}

const initialState: ClerkEnrollmentAppointmentState = {
  status: APIResponseStatus.NotStarted,
  createStatus: APIResponseStatus.NotStarted,
  gradesStatus: APIResponseStatus.NotStarted,
  grades: {
    speakingPartialExam: {
      grade: '',
      comment: '',
    },
    speechComprehensionPartialExam: {
      grade: '',
      comment: '',
    },
    writingPartialExam: {
      grade: '',
      comment: '',
    },
    readingComprehensionPartialExam: {
      grade: '',
      comment: '',
    },
  },
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
    storeClerkEnrollmentAppointmentUpdate(
      state,
      action: PayloadAction<ClerkEnrollmentAppointment>,
    ) {
      state.status = APIResponseStatus.Success;
      state.enrollment = action.payload;
    },
    rejectClerkEnrollmentAppointment(state) {
      state.status = APIResponseStatus.Error;
    },
    updateClerkEnrollmentAppointment(
      state,
      _action: PayloadAction<{
        enrollment: ClerkEnrollmentAppointment;
        examEvent?: ClerkExamEvent;
      }>,
    ) {
      state.status = APIResponseStatus.InProgress;
    },
    resetClerkEnrollmentDetailsUpdate(state) {
      state.status = initialState.status;
    },
    upsertClerkEnrollmentAppointmentGrades(
      state,
      _action: PayloadAction<{
        enrollment: ClerkEnrollmentAppointment;
        grades: ClerkEnrollmentAppointmentGrades;
      }>,
    ) {
      state.gradesStatus = APIResponseStatus.InProgress;
    },
    resetClerkEnrollmentAppointmentGrades(state) {
      state.gradesStatus = initialState.status;
    },
  },
});

export const clerkEnrollmentAppointmentReducer =
  clerkEnrollmentAppointmentSlice.reducer;
export const {
  storeClerkEnrollmentAppointmentUpdate,
  rejectClerkEnrollmentAppointment,
  storeClerkEnrollmentAppointment,
  loadClerkEnrollmentAppointment,
  updateClerkEnrollmentAppointment,
  resetClerkEnrollmentDetailsUpdate,
  upsertClerkEnrollmentAppointmentGrades,
} = clerkEnrollmentAppointmentSlice.actions;
