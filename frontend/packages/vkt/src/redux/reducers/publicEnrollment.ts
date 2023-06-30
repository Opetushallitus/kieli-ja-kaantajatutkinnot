import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  PublicEnrollment,
  PublicReservation,
} from 'interfaces/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { PublicPerson } from 'interfaces/publicPerson';

interface PublicEnrollmentState {
  enrollmentInitialisationStatus: APIResponseStatus;
  renewReservationStatus: APIResponseStatus;
  enrollmentSubmitStatus: APIResponseStatus;
  cancelStatus: APIResponseStatus;
  enrollment: PublicEnrollment;
  examEvent?: PublicExamEvent;
  person?: PublicPerson;
  reservation?: PublicReservation; // undefined if enrolling to queue
}

const initialState: PublicEnrollmentState = {
  enrollmentInitialisationStatus: APIResponseStatus.NotStarted,
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
  examEvent: undefined,
  person: undefined,
  reservation: undefined,
};

const publicEnrollmentSlice = createSlice({
  name: 'publicEnrollment',
  initialState,
  reducers: {
    // TODO: the following three actions are used for fetching exam event details for Authenticate step and should use a separate status
    loadPublicExamEvent(state, _action: PayloadAction<number>) {
      state.enrollmentInitialisationStatus = APIResponseStatus.InProgress;
    },
    rejectPublicExamEvent(state) {
      state.enrollmentInitialisationStatus = APIResponseStatus.Error;
      state.examEvent = initialState.examEvent;
    },
    storePublicExamEvent(state, action: PayloadAction<PublicExamEvent>) {
      state.enrollmentInitialisationStatus = APIResponseStatus.Success;
      state.examEvent = action.payload;
    },
    loadEnrollmentInitialisation(state, _action: PayloadAction<number>) {
      state.enrollmentInitialisationStatus = APIResponseStatus.InProgress;
    },
    rejectEnrollmentInitialisation(state) {
      state.enrollmentInitialisationStatus = APIResponseStatus.Error;
    },
    storeEnrollmentInitialisation(
      state,
      action: PayloadAction<{
        examEvent: PublicExamEvent;
        person: PublicPerson;
        reservation?: PublicReservation;
        enrollment?: PublicEnrollment;
      }>
    ) {
      state.enrollmentInitialisationStatus = APIResponseStatus.Success;
      state.enrollment = action.payload.enrollment ?? state.enrollment;
      state.examEvent = action.payload.examEvent;
      state.person = action.payload.person;
      state.reservation = action.payload.reservation;
    },
    renewReservation(state, _action: PayloadAction<number>) {
      state.renewReservationStatus = APIResponseStatus.InProgress;
    },
    rejectReservationRenew(state) {
      state.renewReservationStatus = APIResponseStatus.Error;
    },
    storeReservationRenew(state, action: PayloadAction<PublicReservation>) {
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
      state.enrollmentInitialisationStatus =
        initialState.enrollmentInitialisationStatus;
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
      const newEnrollment = { ...state.enrollment, ...action.payload };

      state.enrollment = {
        ...newEnrollment,
        ...{
          understandingSkill:
            newEnrollment.speechComprehensionPartialExam ||
            newEnrollment.readingComprehensionPartialExam,
        },
      };
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
  loadPublicExamEvent,
  rejectPublicExamEvent,
  storePublicExamEvent,
  loadEnrollmentInitialisation,
  rejectEnrollmentInitialisation,
  storeEnrollmentInitialisation,
  renewReservation,
  rejectReservationRenew,
  storeReservationRenew,
  cancelPublicEnrollment,
  cancelPublicEnrollmentAndRemoveReservation,
  storePublicEnrollmentCancellation,
  resetPublicEnrollment,
  updatePublicEnrollment,
  loadPublicEnrollmentSave,
  rejectPublicEnrollmentSave,
  storePublicEnrollmentSave,
} = publicEnrollmentSlice.actions;
