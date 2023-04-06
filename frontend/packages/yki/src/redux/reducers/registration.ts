import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import {
  PublicEmailRegistration,
  PublicRegistrationInitResponse,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';

interface RegistrationState {
  initRegistrationStatus: APIResponseStatus;
  submitRegistrationStatus: APIResponseStatus;
  isEmailRegistration?: boolean;
  registration: Partial<PublicSuomiFiRegistration | PublicEmailRegistration>;
  activeStep: PublicRegistrationFormStep;
  showErrors: boolean;
}

const initialState: RegistrationState = {
  activeStep: PublicRegistrationFormStep.Identify,
  initRegistrationStatus: APIResponseStatus.NotStarted,
  submitRegistrationStatus: APIResponseStatus.NotStarted,
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
      state.initRegistrationStatus = APIResponseStatus.InProgress;
    },
    rejectPublicRegistrationInit(state) {
      state.initRegistrationStatus = APIResponseStatus.Error;
    },
    resetPublicRegistration() {
      return initialState;
    },
    acceptPublicRegistrationInit(
      state,
      action: PayloadAction<PublicRegistrationInitResponse>
    ) {
      state.initRegistrationStatus = APIResponseStatus.Success;
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
