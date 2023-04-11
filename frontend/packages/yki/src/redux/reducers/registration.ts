import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  PublicRegistrationFormStep,
  PublicRegistrationFormSubmitError,
  PublicRegistrationInitError,
} from 'enums/publicRegistration';
import {
  PublicEmailRegistration,
  PublicRegistrationInitErrorResponse,
  PublicRegistrationInitResponse,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';

interface RegistrationState {
  initRegistration: {
    status: APIResponseStatus;
    error?: PublicRegistrationInitError;
  };
  submitRegistration: {
    status: APIResponseStatus;
    error?: PublicRegistrationFormSubmitError;
  };
  isEmailRegistration?: boolean;
  registration: Partial<PublicSuomiFiRegistration | PublicEmailRegistration>;
  activeStep: PublicRegistrationFormStep;
  showErrors: boolean;
}

const initialState: RegistrationState = {
  activeStep: PublicRegistrationFormStep.Identify,
  initRegistration: {
    status: APIResponseStatus.NotStarted,
  },
  submitRegistration: { status: APIResponseStatus.NotStarted },
  registration: {
    privacyStatementConfirmation: false,
    termsAndConditionsAgreed: false,
  },
  showErrors: false,
};

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    initRegistration(state, _action: PayloadAction<number>) {
      state.initRegistration.status = APIResponseStatus.InProgress;
    },
    rejectPublicRegistrationInit(
      state,
      action: PayloadAction<PublicRegistrationInitErrorResponse>
    ) {
      state.initRegistration.status = APIResponseStatus.Error;
      const { closed, full, registered } = action.payload.error;
      if (closed) {
        state.initRegistration.error =
          PublicRegistrationInitError.RegistrationPeriodClosed;
      } else if (full) {
        state.initRegistration.error =
          PublicRegistrationInitError.ExamSessionFull;
      } else if (registered) {
        state.initRegistration.error =
          PublicRegistrationInitError.AlreadyRegistered;
      }
    },
    resetPublicRegistration() {
      return initialState;
    },
    acceptPublicRegistrationInit(
      state,
      action: PayloadAction<PublicRegistrationInitResponse>
    ) {
      state.initRegistration = { status: APIResponseStatus.Success };
      const { registration_id, is_strongly_identified, user } = action.payload;
      if (is_strongly_identified) {
        state.isEmailRegistration = false;
        state.registration = {
          ...state.registration,
          id: registration_id,
          firstNames: user.first_name,
          lastName: user.last_name,
          hasSSN: !!user.ssn,
          ssn: user.ssn,
        };
      } else {
        state.isEmailRegistration = true;
        state.registration = {
          ...state.registration,
          id: registration_id,
          email: user.email,
        };
      }
    },
    setShowErrors(state, action: PayloadAction<boolean>) {
      state.showErrors = action.payload;
    },
    updatePublicRegistration(
      state,
      action: PayloadAction<
        Partial<PublicSuomiFiRegistration | PublicEmailRegistration>
      >
    ) {
      state.registration = { ...state.registration, ...action.payload };
    },
    increaseActiveStep(state) {
      state.activeStep = ++state.activeStep;
    },
    setActiveStep(state, action: PayloadAction<PublicRegistrationFormStep>) {
      state.activeStep = action.payload;
    },
  },
});

export const registrationReducer = registrationSlice.reducer;
export const {
  acceptPublicRegistrationInit,
  increaseActiveStep,
  initRegistration,
  rejectPublicRegistrationInit,
  resetPublicRegistration,
  setActiveStep,
  setShowErrors,
  updatePublicRegistration,
} = registrationSlice.actions;
