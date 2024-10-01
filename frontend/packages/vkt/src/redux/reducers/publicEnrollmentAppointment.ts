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

export const initialState: PublicEnrollmentState = {
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
    id: 1, // FIXME
    hasPreviousEnrollment: undefined,
    previousEnrollment: '',
    privacyStatementConfirmation: false,
    status: undefined,
    examEventId: undefined,
    hasPaymentLink: undefined,
    isQueued: undefined,
  },
  person: { // FIXME
    firstName: 'foo',
    lastName: 'bar',
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
    storePublicEnrollmentAppointment(state) {
      state.loadEnrollmentStatus = APIResponseStatus.Success;
    },
    setLoadingPayment(state) {
      state.paymentLoadingStatus = APIResponseStatus.InProgress;
    },
  },
});

export const publicEnrollmentAppointmentReducer =
  publicEnrollmentAppointmentSlice.reducer;
export const {
  loadPublicEnrollmentAppointment,
  rejectPublicEnrollmentAppointment,
  storePublicEnrollmentAppointment,
  setLoadingPayment,
} = publicEnrollmentAppointmentSlice.actions;
