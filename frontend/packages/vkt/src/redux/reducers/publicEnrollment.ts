import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  PublicEnrollment,
  PublicReservation,
} from 'interfaces/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { PublicPerson } from 'interfaces/publicPerson';

interface PublicEnrollmentState {
  loadExamEventStatus: APIResponseStatus;
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
  loadExamEventStatus: APIResponseStatus.NotStarted,
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
    id: undefined,
    hasPreviousEnrollment: undefined,
    previousEnrollment: '',
    privacyStatementConfirmation: false,
    status: undefined,
  },
  examEvent: undefined,
  person: undefined,
  reservation: undefined,
};

const publicEnrollmentSlice = createSlice({
  name: 'publicEnrollment',
  initialState,
  reducers: {
    loadPublicExamEvent(state, _action: PayloadAction<number>) {
      state.loadExamEventStatus = APIResponseStatus.InProgress;
    },
    rejectPublicExamEvent(state) {
      state.loadExamEventStatus = APIResponseStatus.Error;
      state.examEvent = initialState.examEvent;
    },
    storePublicExamEvent(state, action: PayloadAction<PublicExamEvent>) {
      state.loadExamEventStatus = APIResponseStatus.Success;
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
      state.examEvent = action.payload.examEvent;
      state.person = action.payload.person;
      state.reservation = action.payload.reservation;
      state.enrollment = action.payload.enrollment ?? state.enrollment;
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
      state.cancelStatus = APIResponseStatus.Success;
    },
    cancelPublicEnrollmentAndRemoveReservation(
      state,
      _action: PayloadAction<number>
    ) {
      state.cancelStatus = APIResponseStatus.InProgress;
    },
    resetPublicEnrollment() {
      return initialState;
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
  resetPublicEnrollment,
  updatePublicEnrollment,
  loadPublicEnrollmentSave,
  rejectPublicEnrollmentSave,
  storePublicEnrollmentSave,
} = publicEnrollmentSlice.actions;
