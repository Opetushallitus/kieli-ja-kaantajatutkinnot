import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { APIResponseStatus } from 'shared/enums';

import { RegistrationKind, RegistrationStates } from 'enums/app';
import {
  PublicRegistrationFormStep,
  PublicRegistrationFormSubmitError,
  PublicRegistrationInitError,
} from 'enums/publicRegistration';
import { RegistrationKey } from 'features/registration/interfaces/registration';
import {
  isRegistrationInitErrorResponse,
  PartialExamType,
  PublicEmailRegistration,
  PublicRegistrationDetails,
  PublicRegistrationFormSubmitErrorResponse,
  PublicRegistrationFormSubmitSuccessResponse,
  PublicRegistrationInitErrorState,
  PublicRegistrationInitPayload,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';

export interface RegistrationState {
  initRegistration: {
    status: APIResponseStatus;
    error?: PublicRegistrationInitErrorState;
    examSessionId?: number;
    partialExamType?: PartialExamType;
    registrationId?: number;
    registrationKind?: RegistrationKind;
    expiresIn?: number;
  };
  submitRegistration: {
    code?: string;
    status: APIResponseStatus;
    error?: PublicRegistrationFormSubmitError;
    registrationKind?: RegistrationKind;
    finalState?: RegistrationStates;
  };
  cancelRegistration: {
    status: APIResponseStatus;
  };
  isEmailRegistration?: boolean;
  hasSuomiFiNationalityData: boolean;
  registration: Partial<PublicSuomiFiRegistration | PublicEmailRegistration>;
  activeStep: PublicRegistrationFormStep;
  showErrors: boolean;
  hasTimerExpired: boolean;
  fetchRegistrationStatus: APIResponseStatus;
}

export const initialState: RegistrationState = {
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
    countryCode: '246',
  },
  showErrors: false,
  hasTimerExpired: false,
  fetchRegistrationStatus: APIResponseStatus.NotStarted,
};

// Init and GET return the same registration details.
const applyRegistrationDetails = (
  state: RegistrationState,
  details: PublicRegistrationDetails,
) => {
  state.initRegistration.error = undefined;
  state.initRegistration.examSessionId = details.exam_session.id;
  state.initRegistration.status = APIResponseStatus.Success;
  state.initRegistration.expiresIn = details?.expires_in;
  state.initRegistration.partialExamType = details.partial_exam_type;

  const { registration_id, is_strongly_identified, user, registration_kind } =
    details;
  const nationality = user.nationalities && user.nationalities[0];
  state.initRegistration.registrationKind = registration_kind;
  state.initRegistration.registrationId = registration_id;
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
};

const registrationSlice = createSlice({
  name: 'registrationVw/registration',
  initialState,
  reducers: {
    initRegistration(
      state,
      action: PayloadAction<PublicRegistrationInitPayload>,
    ) {
      Object.assign(state, initialState);
      state.initRegistration = { status: APIResponseStatus.InProgress };
      state.initRegistration.examSessionId = action.payload.examSessionId;
      state.initRegistration.registrationKind = action.payload.registrationKind;
      state.initRegistration.partialExamType = action.payload.partialExamType;
    },
    rejectPublicRegistrationInit(
      state,
      action: PayloadAction<AxiosResponse | undefined>,
    ) {
      state.initRegistration.status = APIResponseStatus.Error;
      if (!action.payload) {
        state.initRegistration.error = {
          error: PublicRegistrationInitError.Generic,
        };
      } else {
        if (isRegistrationInitErrorResponse(action.payload)) {
          const error = action.payload.data.error;
          const { closed, full, partialFull } = error;
          if (closed) {
            state.initRegistration.error = {
              error: PublicRegistrationInitError.Past,
            };
          } else if (error['other-exam-session-registration']) {
            state.initRegistration.error = {
              error: PublicRegistrationInitError.AlreadyRegistered,
              otherExamSessionRegistration:
                error['other-exam-session-registration'],
            };
          } else if (partialFull) {
            state.initRegistration.error = {
              error: PublicRegistrationInitError.ExamSessionPartialFull,
            };
          } else if (full) {
            state.initRegistration.error = {
              error: PublicRegistrationInitError.ExamSessionFull,
            };
          } else {
            state.initRegistration.error = {
              error: PublicRegistrationInitError.Generic,
            };
          }
        } else if (action.payload.status === 401) {
          state.initRegistration.error = {
            error: PublicRegistrationInitError.Unauthorized,
          };
          state.activeStep = PublicRegistrationFormStep.Identify;
        } else {
          state.initRegistration.error = {
            error: PublicRegistrationInitError.Generic,
          };
        }
      }
    },
    resetPublicRegistration() {
      return initialState;
    },
    acceptPublicRegistrationInit(
      state,
      action: PayloadAction<PublicRegistrationDetails>,
    ) {
      applyRegistrationDetails(state, action.payload);
    },
    setShowErrors(state, action: PayloadAction<boolean>) {
      state.showErrors = action.payload;
    },
    submitPublicRegistration(state) {
      state.submitRegistration.status = APIResponseStatus.InProgress;
    },
    acceptPublicRegistrationSubmission(
      state,
      action: PayloadAction<PublicRegistrationFormSubmitSuccessResponse>,
    ) {
      state.submitRegistration.status = APIResponseStatus.Success;
      state.submitRegistration.code = action.payload.code;
      state.submitRegistration.registrationKind =
        action.payload.registration_kind;
      state.submitRegistration.finalState = action.payload.state;
    },
    rejectPublicRegistrationSubmission(
      state,
      action: PayloadAction<PublicRegistrationFormSubmitErrorResponse>,
    ) {
      state.submitRegistration.status = APIResponseStatus.Error;
      const { closed, create_payment, expired, person_creation, registered } =
        action.payload.error;
      if (closed) {
        state.submitRegistration.error =
          PublicRegistrationFormSubmitError.RegistrationPeriodClosed;
      } else if (registered) {
        state.submitRegistration.error =
          PublicRegistrationFormSubmitError.AlreadyRegistered;
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
    setHasTimerExpired(state, action: PayloadAction<boolean>) {
      state.hasTimerExpired = action.payload;
    },
    fetchRegistrationDetails(state, action: PayloadAction<RegistrationKey>) {
      state.fetchRegistrationStatus = APIResponseStatus.InProgress;
      state.initRegistration.status = APIResponseStatus.InProgress;
      state.initRegistration.error = undefined;
      state.initRegistration.examSessionId = action.payload.examSessionId;
      state.initRegistration.registrationId = action.payload.registrationId;
    },
    rejectRegistrationDetails(state) {
      state.fetchRegistrationStatus = APIResponseStatus.Error;
    },
    acceptFetchRegistrationDetails(
      state,
      action: PayloadAction<PublicRegistrationDetails>,
    ) {
      state.fetchRegistrationStatus = APIResponseStatus.Success;
      applyRegistrationDetails(state, action.payload);
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
  fetchRegistrationDetails,
  rejectRegistrationDetails,
  acceptFetchRegistrationDetails,
  setHasTimerExpired,
} = registrationSlice.actions;
