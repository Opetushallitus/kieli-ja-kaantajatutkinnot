import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkEnrollmentAppointment,
  ClerkEnrollmentAppointmentGrades,
} from 'interfaces/clerkEnrollment';
import { ExaminerExamEvent } from 'interfaces/examinerExamEvent';

interface ClerkEnrollmentAppointmentState {
  status: APIResponseStatus;
  enrollment?: ClerkEnrollmentAppointment;
  createStatus: APIResponseStatus;
  gradesStatus: APIResponseStatus;
  examEventsStatus: APIResponseStatus;
  examEvents: Array<ExaminerExamEvent>;
  grades?: ClerkEnrollmentAppointmentGrades;
}

const initialState: ClerkEnrollmentAppointmentState = {
  status: APIResponseStatus.NotStarted,
  createStatus: APIResponseStatus.NotStarted,
  gradesStatus: APIResponseStatus.NotStarted,
  examEventsStatus: APIResponseStatus.NotStarted,
  examEvents: [],
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
    loadExaminerExamEvents(state, _action: PayloadAction<string>) {
      state.examEventsStatus = APIResponseStatus.InProgress;
    },
    storeExaminerExamEvents(
      state,
      action: PayloadAction<Array<ExaminerExamEvent>>,
    ) {
      state.examEvents = action.payload;
      state.examEventsStatus = APIResponseStatus.Success;
    },
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
        oid: string;
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
    storeClerkEnrollmentAppointmentGrades(
      state,
      action: PayloadAction<ClerkEnrollmentAppointmentGrades>,
    ) {
      state.gradesStatus = APIResponseStatus.Success;
      state.grades = action.payload;
    },
    resetClerkEnrollmentAppointmentGrades(state) {
      state.gradesStatus = initialState.status;
    },
  },
});

export const clerkEnrollmentAppointmentReducer =
  clerkEnrollmentAppointmentSlice.reducer;
export const {
  loadExaminerExamEvents,
  storeExaminerExamEvents,
  storeClerkEnrollmentAppointmentUpdate,
  rejectClerkEnrollmentAppointment,
  storeClerkEnrollmentAppointment,
  loadClerkEnrollmentAppointment,
  updateClerkEnrollmentAppointment,
  resetClerkEnrollmentDetailsUpdate,
  upsertClerkEnrollmentAppointmentGrades,
  storeClerkEnrollmentAppointmentGrades,
  resetClerkEnrollmentAppointmentGrades,
} = clerkEnrollmentAppointmentSlice.actions;
