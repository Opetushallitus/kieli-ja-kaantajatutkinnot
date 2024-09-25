import { createSlice, current, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  Attachment,
  PublicFreeEnrollmentDetails,
} from 'interfaces/publicEducation';
import {
  PublicEnrollment,
  PublicReservation,
} from 'interfaces/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { PublicPerson } from 'interfaces/publicPerson';
import { EnrollmentUtils } from 'utils/enrollment';

export interface PublicEnrollmentAppointmentState {
  loadEnrollmentStatus: APIResponseStatus;
  enrollmentSubmitStatus: APIResponseStatus;
  paymentLoadingStatus: APIResponseStatus;
  cancelStatus: APIResponseStatus;
  enrollment: PublicEnrollment;
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
    id: undefined,
    hasPreviousEnrollment: undefined,
    previousEnrollment: '',
    privacyStatementConfirmation: false,
    status: undefined,
    examEventId: undefined,
    hasPaymentLink: undefined,
    isQueued: undefined,
  },
  person: undefined,
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
    storePublicEnrollmentAppointment(state, action: PayloadAction<PublicExamEvent>) {
      state.loadEnrollmentStatus = APIResponseStatus.Success;
    },
    setLoadingPayment(state) {
      state.paymentLoadingStatus = APIResponseStatus.InProgress;
    },
  },
});

export const publicEnrollmentAppointmentReducer = publicEnrollmentAppointmentSlice.reducer;
export const {
  loadPublicEnrollmentAppointment,
  rejectPublicEnrollmentAppointment,
  storePublicEnrollmentAppointment,
  setLoadingPayment,
} = publicEnrollmentAppointmentSlice.actions;
