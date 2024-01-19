import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  PublicRegistrationFormStep,
  PublicRegistrationFormSubmitError,
  PublicRegistrationInitError,
} from 'enums/publicRegistration';
import {
  PublicEmailRegistration,
  PublicRegistrationFormSubmitErrorResponse,
  PublicRegistrationInitErrorResponse,
  PublicRegistrationInitResponse,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';

export interface RegistrationState {
  initRegistration: {
    status: APIResponseStatus;
    error?: PublicRegistrationInitError;
    examSessionId?: number;
  };
  submitRegistration: {
    status: APIResponseStatus;
    error?: PublicRegistrationFormSubmitError;
  };
  cancelRegistration: {
    status: APIResponseStatus;
  };
  isEmailRegistration?: boolean;
  hasSuomiFiNationalityData: boolean;
  registration: Partial<PublicSuomiFiRegistration | PublicEmailRegistration>;
  activeStep: PublicRegistrationFormStep;
  showErrors: boolean;
}

const initialState: RegistrationState = {
  activeStep: PublicRegistrationFormStep.Identify,
  initRegistration: {
    status: APIResponseStatus.NotStarted,
  },
  cancelRegistration: {
    status: APIResponseStatus.NotStarted,
  },
  hasSuomiFiNationalityData: false,
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
    initRegistration(state, action: PayloadAction<number>) {
      state.initRegistration.status = APIResponseStatus.InProgress;
      state.initRegistration.examSessionId = action.payload;
    },
    rejectPublicRegistrationInit(
      state,
      action: PayloadAction<PublicRegistrationInitErrorResponse>,
    ) {
      state.initRegistration.status = APIResponseStatus.Error;
      const { closed, full, registered } = action.payload.error;
      if (closed) {
        state.initRegistration.error = PublicRegistrationInitError.Past;
      } else if (full) {
        state.initRegistration.error =
          PublicRegistrationInitError.ExamSessionFull;
      } else if (registered) {
        state.initRegistration.error =
          PublicRegistrationInitError.AlreadyRegistered;
      } else {
        state.initRegistration.error = PublicRegistrationInitError.Generic;
      }
    },
    resetPublicRegistration() {
      return initialState;
    },
    acceptPublicRegistrationInit(
      state,
      action: PayloadAction<PublicRegistrationInitResponse>,
    ) {
      state.initRegistration.status = APIResponseStatus.Success;
      const { registration_id, is_strongly_identified, user } = action.payload;
      const nationality = user.nationalities && user.nationalities[0];
      if (is_strongly_identified) {
        state.isEmailRegistration = false;
        state.hasSuomiFiNationalityData = !!nationality;
        state.registration = {
          ...state.registration,
          id: registration_id,
          firstNames: user.first_name,
          lastName: user.last_name,
          hasSSN: !!user.ssn,
          ssn: user.ssn,
          nationality,
          address: user.street_address,
          postNumber: user.zip,
          postOffice: user.post_office,
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
    submitPublicRegistration(state) {
      state.submitRegistration.status = APIResponseStatus.InProgress;
    },
    acceptPublicRegistrationSubmission(state) {
      state.submitRegistration.status = APIResponseStatus.Success;
    },
    rejectPublicRegistrationSubmission(
      state,
      action: PayloadAction<PublicRegistrationFormSubmitErrorResponse>,
    ) {
      state.submitRegistration.status = APIResponseStatus.Error;
      const { closed, create_payment, expired, person_creation } =
        action.payload.error;
      if (closed) {
        state.submitRegistration.error =
          PublicRegistrationFormSubmitError.RegistrationPeriodClosed;
      } else if (create_payment) {
        state.submitRegistration.error =
          PublicRegistrationFormSubmitError.PaymentCreationFailed;
      } else if (person_creation) {
        state.submitRegistration.error =
          PublicRegistrationFormSubmitError.PersonCreationFailed;
      } else if (expired) {
        state.submitRegistration.error =
          PublicRegistrationFormSubmitError.FormExpired;
      }
    },
    updatePublicRegistration(
      state,
      action: PayloadAction<
        Partial<PublicSuomiFiRegistration | PublicEmailRegistration>
      >,
    ) {
      state.registration = { ...state.registration, ...action.payload };
    },
    increaseActiveStep(state) {
      state.activeStep = ++state.activeStep;
    },
    setActiveStep(state, action: PayloadAction<PublicRegistrationFormStep>) {
      state.activeStep = action.payload;
    },
    cancelRegistration(state) {
      state.cancelRegistration.status = APIResponseStatus.InProgress;
    },
    acceptCancelRegistration(state) {
      state.cancelRegistration.status = APIResponseStatus.Success;
    },
    rejectCancelRegistration(state) {
      state.cancelRegistration.status = APIResponseStatus.Error;
    },
  },
});

export const registrationReducer = registrationSlice.reducer;
export const {
  acceptPublicRegistrationInit,
  acceptPublicRegistrationSubmission,
  increaseActiveStep,
  initRegistration,
  rejectPublicRegistrationInit,
  rejectPublicRegistrationSubmission,
  resetPublicRegistration,
  setActiveStep,
  setShowErrors,
  submitPublicRegistration,
  updatePublicRegistration,
  cancelRegistration,
  acceptCancelRegistration,
  rejectCancelRegistration,
} = registrationSlice.actions;
