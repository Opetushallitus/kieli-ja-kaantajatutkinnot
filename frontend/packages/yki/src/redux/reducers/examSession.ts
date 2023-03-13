import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { CertificateLanguage } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { ExamSession } from 'interfaces/examSessions';
import {
  PublicEmailRegistration,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';

interface ExamSessionState {
  status: APIResponseStatus;
  activeStep: PublicRegistrationFormStep;
  examSession?: ExamSession;
  registration: PublicSuomiFiRegistration | PublicEmailRegistration;
  isEmailRegistration?: boolean;
}

const initialState: ExamSessionState = {
  status: APIResponseStatus.NotStarted,
  activeStep: PublicRegistrationFormStep.Identify,
  registration: {
    firstNames: 'Test',
    lastName: 'Tester',
    address: '',
    postNumber: '',
    postOffice: '',
    email: '',
    emailConfirmation: '',
    phoneNumber: '',
    privacyStatementConfirmation: false,
    certificateLanguage: CertificateLanguage.FI,
    termsAndConditionsAgreed: false,
  },
};

const examSessionSlice = createSlice({
  name: 'examSession',
  initialState,
  reducers: {
    loadExamSession(state, _action: PayloadAction<number>) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectExamSession(state) {
      state.status = APIResponseStatus.Error;
    },
    storeExamSession(state, action: PayloadAction<ExamSession>) {
      state.status = APIResponseStatus.Success;
      state.examSession = action.payload;
    },
    decreaseActiveStep(state) {
      state.activeStep = --state.activeStep;
    },
    increaseActiveStep(state) {
      state.activeStep = ++state.activeStep;
    },
    updatePublicRegistration(
      state,
      action: PayloadAction<
        Partial<PublicSuomiFiRegistration | PublicEmailRegistration>
      >
    ) {
      state.registration = { ...state.registration, ...action.payload };
    },
    resetPublicRegistration() {
      return initialState;
    },
  },
});

export const examSessionReducer = examSessionSlice.reducer;
export const {
  loadExamSession,
  rejectExamSession,
  storeExamSession,
  increaseActiveStep,
  decreaseActiveStep,
  updatePublicRegistration,
  resetPublicRegistration,
} = examSessionSlice.actions;
