import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  PublicEnrollment,
  PublicReservation,
} from 'interfaces/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { PublicPerson } from 'interfaces/publicPerson';

interface PublicEnrollmentState {
  reservationDetailsStatus: APIResponseStatus; // TODO: rename
  renewReservationStatus: APIResponseStatus;
  enrollmentSubmitStatus: APIResponseStatus;
  cancelStatus: APIResponseStatus;
  enrollment: PublicEnrollment;
  examEvent?: PublicExamEvent;
  person?: PublicPerson;
  reservation?: PublicReservation; // undefined if enrolling to queue
}

const initialState: PublicEnrollmentState = {
  reservationDetailsStatus: APIResponseStatus.NotStarted,
  renewReservationStatus: APIResponseStatus.NotStarted,
  enrollmentSubmitStatus: APIResponseStatus.NotStarted,
  cancelStatus: APIResponseStatus.NotStarted,
  enrollment: {
    email: '',
    emailConfirmation: '',
    phoneNumber: '',
    oralSkill: false,
    textualSkill: false,
    understandingSkill: false,
    speakingPartialExam: false,
    speechComprehensionPartialExam: false,
    writingPartialExam: false,
    readingComprehensionPartialExam: false,
    digitalCertificateConsent: false,
    street: '',
    postalCode: '',
    town: '',
    country: '',
    previousEnrollment: '',
    privacyStatementConfirmation: false,
  },
};

const publicEnrollmentSlice = createSlice({
  name: 'publicEnrollment',
  initialState,
  reducers: {
    loadPublicEnrollment(state, _action: PayloadAction<number>) {
      state.reservationDetailsStatus = APIResponseStatus.InProgress;
    },
    loadPublicExamEvent(state, _action: PayloadAction<number>) {
      state.reservationDetailsStatus = APIResponseStatus.InProgress;
    },
    initialisePublicEnrollment(state, _action: PayloadAction<PublicExamEvent>) {
      state.reservationDetailsStatus = APIResponseStatus.InProgress;
    },
    rejectPublicEnrollmentInitialisation(state) {
      state.reservationDetailsStatus = APIResponseStatus.Error;
    },
    rejectPublicExamEvent(state) {
      state.reservationDetailsStatus = APIResponseStatus.Error;
      state.examEvent = initialState.examEvent;
    },
    setPublicExamEvent(state, action: PayloadAction<PublicExamEvent>) {
      state.examEvent = action.payload;
    },
    storeReservationDetails(
      state,
      action: PayloadAction<{
        examEvent: PublicExamEvent;
        person: PublicPerson;
        reservation?: PublicReservation;
        enrollment?: PublicEnrollment;
      }>
    ) {
      state.reservationDetailsStatus = APIResponseStatus.Success;
      state.enrollment = action.payload.enrollment ?? state.enrollment;
      state.examEvent = action.payload.examEvent;
      state.person = action.payload.person;
      state.reservation = action.payload.reservation;
    },
    storePublicExamEvent(state, action: PayloadAction<PublicExamEvent>) {
      state.reservationDetailsStatus = APIResponseStatus.Success;
      state.examEvent = action.payload;
    },
    renewPublicEnrollmentReservation(state, _action: PayloadAction<number>) {
      state.renewReservationStatus = APIResponseStatus.InProgress;
    },
    rejectPublicReservationRenew(state) {
      state.renewReservationStatus = APIResponseStatus.Error;
    },
    updatePublicEnrollmentReservation(
      state,
      action: PayloadAction<PublicReservation>
    ) {
      state.renewReservationStatus = APIResponseStatus.Success;
      state.reservation = action.payload;
    },
    cancelPublicEnrollment(state) {
      state.cancelStatus = APIResponseStatus.InProgress;
    },
    cancelPublicEnrollmentAndRemoveReservation(
      state,
      _action: PayloadAction<number>
    ) {
      state.cancelStatus = APIResponseStatus.InProgress;
    },
    storePublicEnrollmentCancellation(state) {
      state.cancelStatus = APIResponseStatus.Success;
    },
    resetPublicEnrollment(state) {
      state.reservationDetailsStatus = initialState.reservationDetailsStatus;
      state.renewReservationStatus = initialState.renewReservationStatus;
      state.enrollmentSubmitStatus = initialState.enrollmentSubmitStatus;
      state.cancelStatus = initialState.cancelStatus;
      state.enrollment = initialState.enrollment;
      state.examEvent = initialState.examEvent;
      state.person = initialState.person;
      state.reservation = initialState.reservation;
    },
    updatePublicEnrollment(
      state,
      action: PayloadAction<Partial<PublicEnrollment>>
    ) {
      state.enrollment = { ...state.enrollment, ...action.payload };
    },
    loadPublicEnrollmentSave(
      state,
      _action: PayloadAction<{
        enrollment: PublicEnrollment;
        examEventId: number;
        reservationId?: number;
      }>
    ) {
      state.enrollmentSubmitStatus = APIResponseStatus.InProgress;
    },
    rejectPublicEnrollmentSave(state) {
      state.enrollmentSubmitStatus = APIResponseStatus.Error;
    },
    storePublicEnrollmentSave(state, action: PayloadAction<PublicEnrollment>) {
      state.enrollmentSubmitStatus = APIResponseStatus.Success;
      state.enrollment = { ...state.enrollment, ...action.payload };
    },
  },
});

export const publicEnrollmentReducer = publicEnrollmentSlice.reducer;
export const {
  loadPublicEnrollment,
  loadPublicExamEvent,
  initialisePublicEnrollment,
  rejectPublicEnrollmentInitialisation,
  rejectPublicExamEvent,
  setPublicExamEvent,
  storeReservationDetails,
  storePublicExamEvent,
  cancelPublicEnrollment,
  cancelPublicEnrollmentAndRemoveReservation,
  storePublicEnrollmentCancellation,
  resetPublicEnrollment,
  updatePublicEnrollment,
  updatePublicEnrollmentReservation,
  loadPublicEnrollmentSave,
  rejectPublicEnrollmentSave,
  rejectPublicReservationRenew,
  storePublicEnrollmentSave,
  renewPublicEnrollmentReservation,
} = publicEnrollmentSlice.actions;
