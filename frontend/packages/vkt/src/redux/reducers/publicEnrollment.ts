import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import {
  PublicEnrollment,
  PublicReservation,
  PublicReservationDetails,
} from 'interfaces/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';

interface PublicEnrollmentState {
  reservationDetailsStatus: APIResponseStatus;
  reservationDetails?: PublicReservationDetails;
  status: APIResponseStatus;
  cancelStatus: APIResponseStatus;
  activeStep: PublicEnrollmentFormStep;
  enrollment: PublicEnrollment;
}

const initialState: PublicEnrollmentState = {
  reservationDetailsStatus: APIResponseStatus.NotStarted,
  reservationDetails: undefined,
  selectedExamEvent: undefined,
  status: APIResponseStatus.NotStarted,
  cancelStatus: APIResponseStatus.NotStarted,
  reservationDetailsStatus: APIResponseStatus.NotStarted,
  activeStep: PublicEnrollmentFormStep.Authenticate,
  enrollToQueue: undefined,
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
    initialisePublicEnrollment(state, _action: PayloadAction<PublicExamEvent>) {
      state.reservationDetailsStatus = APIResponseStatus.InProgress;
    },
    rejectPublicEnrollmentInitialisation(state) {
      state.reservationDetailsStatus = APIResponseStatus.Error;
    },
    setPublicEnrollmentSelectedExam(
      state,
      action: PayloadAction<PublicExamEvent>
    ) {
      state.selectedExamEvent = action.payload;
    },
    storePublicEnrollmentInitialisation(
      state,
      action: PayloadAction<PublicReservationDetails>
    ) {
      state.reservationDetailsStatus = APIResponseStatus.Success;
      state.reservationDetails = action.payload;
      state.selectedExamEvent = action.payload.examEvent;
      state.enrollment = action.payload.enrollment ?? state.enrollment;
    },
    renewPublicEnrollmentReservation(state, _action: PayloadAction<number>) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectPublicReservationRenew(state) {
      state.status = APIResponseStatus.Error;
    },
    updatePublicEnrollmentReservation(
      state,
      action: PayloadAction<PublicReservation>
    ) {
      state.status = APIResponseStatus.Success;
      state.reservationDetails = {
        ...state.reservationDetails,
        reservation: action.payload,
      } as PublicReservationDetails;
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
    decreaseActiveStep(state) {
      state.activeStep = --state.activeStep;
    },
    increaseActiveStep(state) {
      state.activeStep = ++state.activeStep;
    },
    resetPublicEnrollment(state) {
      state.reservationDetailsStatus = initialState.reservationDetailsStatus;
      state.reservationDetails = initialState.reservationDetails;
      state.status = initialState.status;
      state.activeStep = initialState.activeStep;
      state.enrollment = initialState.enrollment;
      state.cancelStatus = initialState.cancelStatus;
      state.selectedExamEvent = initialState.selectedExamEvent;
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
        reservationDetails: PublicReservationDetails;
      }>
    ) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectPublicEnrollmentSave(state) {
      state.status = APIResponseStatus.Error;
    },
    storePublicEnrollmentSave(state, action: PayloadAction<PublicEnrollment>) {
      state.status = APIResponseStatus.Success;
      state.enrollment = { ...state.enrollment, ...action.payload };
      console.log('store enrollment');
    },
  },
});

export const publicEnrollmentReducer = publicEnrollmentSlice.reducer;
export const {
  loadPublicEnrollment,
  initialisePublicEnrollment,
  rejectPublicEnrollmentInitialisation,
  setPublicEnrollmentSelectedExam,
  storePublicEnrollmentInitialisation,
  cancelPublicEnrollment,
  cancelPublicEnrollmentAndRemoveReservation,
  storePublicEnrollmentCancellation,
  decreaseActiveStep,
  increaseActiveStep,
  resetPublicEnrollment,
  updatePublicEnrollment,
  updatePublicEnrollmentReservation,
  loadPublicEnrollmentSave,
  rejectPublicEnrollmentSave,
  rejectPublicReservationRenew,
  storePublicEnrollmentSave,
  renewPublicEnrollmentReservation,
} = publicEnrollmentSlice.actions;
