import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkEnrollmentAppointment,
  ClerkEnrollmentAppointmentGrades,
  ClerkEnrollmentAppointmentHistory,
  ClerkEnrollmentAppointmentMove,
  ClerkOnrBirthdate,
} from 'interfaces/clerkEnrollment';

interface ClerkEnrollmentAppointmentState {
  status: APIResponseStatus;
  historyStatus: APIResponseStatus;
  updateStatus: APIResponseStatus;
  cancelStatus: APIResponseStatus;
  enrollment?: ClerkEnrollmentAppointment;
  enrollmentHistory?: Array<ClerkEnrollmentAppointmentHistory>;
  gradesStatus: APIResponseStatus;
  gradesSaveStatus: APIResponseStatus;
  sendLinkStatus: APIResponseStatus;
  grades?: ClerkEnrollmentAppointmentGrades;
  moveStatus: APIResponseStatus;
  onrBirthdate?: ClerkOnrBirthdate;
  birthdateStatus: APIResponseStatus;
  saveBirthdateOrSsnStatus: APIResponseStatus;
}

const initialState: ClerkEnrollmentAppointmentState = {
  status: APIResponseStatus.NotStarted,
  historyStatus: APIResponseStatus.NotStarted,
  updateStatus: APIResponseStatus.NotStarted,
  cancelStatus: APIResponseStatus.NotStarted,
  gradesStatus: APIResponseStatus.NotStarted,
  gradesSaveStatus: APIResponseStatus.NotStarted,
  sendLinkStatus: APIResponseStatus.NotStarted,
  moveStatus: APIResponseStatus.NotStarted,
  grades: {
    version: 0,
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
  birthdateStatus: APIResponseStatus.NotStarted,
  saveBirthdateOrSsnStatus: APIResponseStatus.NotStarted,
  onrBirthdate: undefined,
};

const clerkEnrollmentAppointmentSlice = createSlice({
  name: 'clerkEnrollmentAppointment',
  initialState,
  reducers: {
    loadClerkEnrollmentAppointment(
      state,
      _action: PayloadAction<{
        id: number;
        oid: string;
      }>,
    ) {
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
      state.updateStatus = APIResponseStatus.InProgress;
    },
    storeUpdateClerkEnrollmentAppointment(state) {
      state.updateStatus = APIResponseStatus.Success;
    },
    resetClerkEnrollmentDetailsToInitialState(_state) {
      return initialState;
    },
    resetClerkEnrollmentDetails(state) {
      state.updateStatus = initialState.updateStatus;
      state.status = initialState.status;
      state.gradesSaveStatus = initialState.gradesSaveStatus;
      state.sendLinkStatus = initialState.sendLinkStatus;
    },
    sendClerkEnrollmentAppointmentAuthLink(
      state,
      _action: PayloadAction<{
        enrollmentId: number;
        oid: string;
      }>,
    ) {
      state.sendLinkStatus = APIResponseStatus.InProgress;
    },
    storeClerkEnrollmentAppointmentAuthLink(state) {
      state.sendLinkStatus = APIResponseStatus.Success;
    },
    loadClerkEnrollmentAppointmentGrades(
      state,
      _action: PayloadAction<{
        enrollmentId: number;
        oid: string;
      }>,
    ) {
      state.gradesStatus = APIResponseStatus.Success;
    },
    upsertClerkEnrollmentAppointmentGrades(
      state,
      _action: PayloadAction<{
        enrollment: ClerkEnrollmentAppointment;
        grades: ClerkEnrollmentAppointmentGrades;
        oid: string;
      }>,
    ) {
      state.gradesSaveStatus = APIResponseStatus.InProgress;
    },
    storeClerkEnrollmentAppointmentGradesUpsert(
      state,
      action: PayloadAction<ClerkEnrollmentAppointmentGrades>,
    ) {
      state.gradesSaveStatus = APIResponseStatus.Success;
      state.grades = action.payload;
    },
    storeClerkEnrollmentAppointmentGrades(
      state,
      action: PayloadAction<ClerkEnrollmentAppointmentGrades>,
    ) {
      state.gradesStatus = APIResponseStatus.Success;
      state.grades = action.payload;
    },
    cancelClerkEnrollmentAppointment(
      state,
      _action: PayloadAction<{
        id: number;
        oid: string;
      }>,
    ) {
      state.cancelStatus = APIResponseStatus.InProgress;
    },
    storeCancelClerkEnrollmentAppointment(state) {
      state.cancelStatus = APIResponseStatus.Success;
    },
    loadClerkEnrollmentAppointmentHistory(
      state,
      _action: PayloadAction<{
        enrollmentId: number;
        oid: string;
      }>,
    ) {
      state.historyStatus = APIResponseStatus.InProgress;
    },
    storeLoadClerkEnrollmentAppointmentHistory(
      state,
      action: PayloadAction<Array<ClerkEnrollmentAppointmentHistory>>,
    ) {
      state.enrollmentHistory = action.payload;
      state.historyStatus = APIResponseStatus.Success;
    },
    moveEnrollment(
      state,
      _action: PayloadAction<ClerkEnrollmentAppointmentMove>,
    ) {
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
    loadClerkEnrollmentOnrBirthdate(
      state,
      _action: PayloadAction<{
        personOid: string;
        oid: string;
      }>,
    ) {
      state.birthdateStatus = APIResponseStatus.InProgress;
    },
    storeClerkEnrollmentOnrBirthdate(
      state,
      action: PayloadAction<ClerkOnrBirthdate>,
    ) {
      state.onrBirthdate = action.payload;
      state.birthdateStatus = APIResponseStatus.Success;
    },
    resetClerkEnrollmentOnrBirthdate(state) {
      state.onrBirthdate = undefined;
      state.birthdateStatus = APIResponseStatus.NotStarted;
    },
    saveClerkEnrollmentBirthdateOrSsn(
      state,
      _action: PayloadAction<{
        enrollmentId: number;
        oid: string;
        birthdateOrSsn: string;
      }>,
    ) {
      state.saveBirthdateOrSsnStatus = APIResponseStatus.InProgress;
    },
    storeSaveClerkEnrollmentBirthdateOrSsn(
      state,
      action: PayloadAction<ClerkOnrBirthdate>,
    ) {
      state.saveBirthdateOrSsnStatus = APIResponseStatus.Success;
      state.onrBirthdate = action.payload;
    },
    rejectSaveClerkEnrollmentBirthdateOrSsn(state) {
      state.saveBirthdateOrSsnStatus = APIResponseStatus.Error;
    },
  },
});

export const clerkEnrollmentAppointmentReducer =
  clerkEnrollmentAppointmentSlice.reducer;
export const {
  moveEnrollment,
  moveEnrollmentSucceeded,
  rejectMoveEnrollment,
  resetMoveEnrollment,
  storeClerkEnrollmentAppointmentUpdate,
  rejectClerkEnrollmentAppointment,
  storeClerkEnrollmentAppointment,
  loadClerkEnrollmentAppointment,
  updateClerkEnrollmentAppointment,
  resetClerkEnrollmentDetails,
  upsertClerkEnrollmentAppointmentGrades,
  storeClerkEnrollmentAppointmentGrades,
  loadClerkEnrollmentAppointmentGrades,
  storeClerkEnrollmentAppointmentGradesUpsert,
  sendClerkEnrollmentAppointmentAuthLink,
  storeClerkEnrollmentAppointmentAuthLink,
  storeSaveClerkEnrollmentBirthdateOrSsn,
  storeUpdateClerkEnrollmentAppointment,
  resetClerkEnrollmentDetailsToInitialState,
  cancelClerkEnrollmentAppointment,
  storeCancelClerkEnrollmentAppointment,
  loadClerkEnrollmentAppointmentHistory,
  storeLoadClerkEnrollmentAppointmentHistory,
  loadClerkEnrollmentOnrBirthdate,
  storeClerkEnrollmentOnrBirthdate,
  resetClerkEnrollmentOnrBirthdate,
  saveClerkEnrollmentBirthdateOrSsn,
  rejectSaveClerkEnrollmentBirthdateOrSsn,
} = clerkEnrollmentAppointmentSlice.actions;
