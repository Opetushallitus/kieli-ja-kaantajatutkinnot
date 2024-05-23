import { createSlice, current, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  PublicEnrollment,
  PublicReservation,
} from 'interfaces/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { PublicPerson } from 'interfaces/publicPerson';
import { EnrollmentUtils } from 'utils/enrollment';

export interface PublicEnrollmentState {
  loadExamEventStatus: APIResponseStatus;
  enrollmentInitialisationStatus: APIResponseStatus;
  renewReservationStatus: APIResponseStatus;
  enrollmentSubmitStatus: APIResponseStatus;
  paymentLoadingStatus: APIResponseStatus;
  cancelStatus: APIResponseStatus;
  enrollment: PublicEnrollment;
  examEvent?: PublicExamEvent;
  person?: PublicPerson;
  reservation?: PublicReservation; // undefined if enrolling to queue
}

export const initialState: PublicEnrollmentState = {
  loadExamEventStatus: APIResponseStatus.NotStarted,
  enrollmentInitialisationStatus: APIResponseStatus.NotStarted,
  renewReservationStatus: APIResponseStatus.NotStarted,
  enrollmentSubmitStatus: APIResponseStatus.NotStarted,
  paymentLoadingStatus: APIResponseStatus.NotStarted,
  cancelStatus: APIResponseStatus.NotStarted,
  enrollment: {
    email: '',
    emailConfirmation: '',
    phoneNumber: '',
    isFree: true,
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
    examEventId: undefined,
    hasPaymentLink: undefined,
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
      }>,
    ) {
      state.enrollmentInitialisationStatus = APIResponseStatus.Success;
      const persistedSessionEnrollmentDetails = current(state.enrollment);
      const examEventId = action.payload.examEvent.id;
      if (persistedSessionEnrollmentDetails.examEventId === examEventId) {
        state.enrollment = action.payload.enrollment
          ? EnrollmentUtils.mergeEnrollment(persistedSessionEnrollmentDetails, {
              ...action.payload.enrollment,
              examEventId,
            })
          : state.enrollment;
      } else {
        // Enrollment details persisted in session storage are for different exam event.
        // Reject persisted details.
        state.enrollment = action.payload.enrollment
          ? {
              ...initialState.enrollment,
              ...action.payload.enrollment,
              examEventId,
            }
          : { ...initialState.enrollment, examEventId };
      }

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
      state.cancelStatus = APIResponseStatus.Success;
    },
    cancelPublicEnrollmentAndRemoveReservation(
      state,
      _action: PayloadAction<number>,
    ) {
      state.cancelStatus = APIResponseStatus.InProgress;
    },
    resetPublicEnrollment() {
      return initialState;
    },
    updatePublicEnrollment(
      state,
      action: PayloadAction<Partial<PublicEnrollment>>,
    ) {
      const newEnrollment = { ...state.enrollment, ...action.payload };

      state.enrollment = {
        ...newEnrollment,
        ...{
          understandingSkill:
            newEnrollment.speechComprehensionPartialExam &&
            newEnrollment.readingComprehensionPartialExam,
        },
      };
    },
    loadPublicEnrollmentUpdate(
      state,
      _action: PayloadAction<{
        enrollment: PublicEnrollment;
        examEventId: number;
      }>,
    ) {
      state.enrollmentSubmitStatus = APIResponseStatus.InProgress;
    },
    loadPublicEnrollmentSave(
      state,
      _action: PayloadAction<{
        enrollment: PublicEnrollment;
        examEventId: number;
        reservationId?: number;
      }>,
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
    setPublicEnrollmentExamEventIdIfNotSet(
      state,
      action: PayloadAction<number>,
    ) {
      if (!state.enrollment.examEventId) {
        state.enrollment.examEventId = action.payload;
      }
    },
    setLoadingPayment(state) {
      state.paymentLoadingStatus = APIResponseStatus.InProgress;
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
  loadPublicEnrollmentUpdate,
  rejectPublicEnrollmentSave,
  storePublicEnrollmentSave,
  setPublicEnrollmentExamEventIdIfNotSet,
  setLoadingPayment,
} = publicEnrollmentSlice.actions;
