import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { PublicEnrollmentAppointment } from 'interfaces/publicEnrollment';
import { PublicPerson } from 'interfaces/publicPerson';

export interface PublicEnrollmentAppointmentState {
  loadEnrollmentStatus: APIResponseStatus;
  enrollmentSubmitStatus: APIResponseStatus;
  paymentLoadingStatus: APIResponseStatus;
  cancelStatus: APIResponseStatus;
  enrollment: PublicEnrollmentAppointment;
  person?: PublicPerson;
}

const initialState: PublicEnrollmentAppointmentState = {
  loadEnrollmentStatus: APIResponseStatus.NotStarted,
  enrollmentSubmitStatus: APIResponseStatus.NotStarted,
  paymentLoadingStatus: APIResponseStatus.NotStarted,
  cancelStatus: APIResponseStatus.NotStarted,
  enrollment: {
    email: '',
    emailConfirmation: '',
    phoneNumber: '',
    isFree: false,
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
    isQueued: undefined,
    person: {
      id: -1,
      firstName: '',
      lastName: '',
    },
  },
};

const publicEnrollmentAppointmentSlice = createSlice({
  name: 'publicEnrollmentAppointment',
  initialState,
  reducers: {
    loadPublicEnrollmentAppointment(state, _action: PayloadAction<number>) {
      state.loadEnrollmentStatus = APIResponseStatus.InProgress;
    },
    rejectPublicEnrollmentAppointment(state) {
      state.loadEnrollmentStatus = APIResponseStatus.Error;
    },
    storePublicEnrollmentAppointmentSave(
      state,
      action: PayloadAction<PublicEnrollmentAppointment>,
    ) {
      state.enrollmentSubmitStatus = APIResponseStatus.Success;
      state.enrollment = action.payload;
    },
    storePublicEnrollmentAppointment(
      state,
      action: PayloadAction<PublicEnrollmentAppointment>,
    ) {
      state.loadEnrollmentStatus = APIResponseStatus.Success;
      state.enrollment = action.payload;
    },
    updatePublicEnrollment(
      state,
      action: PayloadAction<Partial<PublicEnrollmentAppointment>>,
    ) {
      state.enrollment = { ...state.enrollment, ...action.payload };
    },
    setLoadingPayment(state) {
      state.paymentLoadingStatus = APIResponseStatus.InProgress;
    },
    loadPublicEnrollmentSave(
      state,
      _action: PayloadAction<PublicEnrollmentAppointment>,
    ) {
      state.enrollmentSubmitStatus = APIResponseStatus.InProgress;
    },
  },
});

export const publicEnrollmentAppointmentReducer =
  publicEnrollmentAppointmentSlice.reducer;
export const {
  loadPublicEnrollmentAppointment,
  rejectPublicEnrollmentAppointment,
  storePublicEnrollmentAppointmentSave,
  storePublicEnrollmentAppointment,
  updatePublicEnrollment,
  loadPublicEnrollmentSave,
  setLoadingPayment,
} = publicEnrollmentAppointmentSlice.actions;
