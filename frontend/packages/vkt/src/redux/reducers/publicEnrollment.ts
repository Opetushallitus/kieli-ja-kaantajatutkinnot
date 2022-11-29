import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';

interface PublicEnrollmentState {
  status: APIResponseStatus;
  activeStep: PublicEnrollmentFormStep;
  enrollment: PublicEnrollment;
}

const initialState: PublicEnrollmentState = {
  status: APIResponseStatus.NotStarted,
  activeStep: PublicEnrollmentFormStep.FillContactDetails,
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
    privacyStatementConfirmation: false,
  },
};

const publicEnrollmentSlice = createSlice({
  name: 'publicEnrollment',
  initialState,
  reducers: {
    cancelPublicEnrollment(state) {
      state.status = APIResponseStatus.InProgress;
    },
    cancelPublicEnrollmentAndRemoveReservation(
      state,
      _action: PayloadAction<number>
    ) {
      state.status = APIResponseStatus.InProgress;
    },
    decreaseActiveStep(state) {
      state.activeStep = --state.activeStep;
    },
    increaseActiveStep(state) {
      state.activeStep = ++state.activeStep;
    },
    resetPublicEnrollment(state) {
      state.status = initialState.status;
      state.activeStep = initialState.activeStep;
      state.enrollment = initialState.enrollment;
    },
    updatePublicEnrollment(
      state,
      action: PayloadAction<Partial<PublicEnrollment>>
    ) {
      state.enrollment = { ...state.enrollment, ...action.payload };
    },
  },
});

export const publicEnrollmentReducer = publicEnrollmentSlice.reducer;
export const {
  cancelPublicEnrollment,
  cancelPublicEnrollmentAndRemoveReservation,
  decreaseActiveStep,
  increaseActiveStep,
  resetPublicEnrollment,
  updatePublicEnrollment,
} = publicEnrollmentSlice.actions;
