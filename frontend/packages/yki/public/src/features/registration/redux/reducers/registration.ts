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
  PublicRegistrationInitResponse,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';

interface RegistrationRequestState {
  status: APIResponseStatus;
  error?: PublicRegistrationInitErrorState;
}

export interface RegistrationState {
  initRegistration: RegistrationRequestState;
  fetchRegistration: RegistrationRequestState;
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
  registration: Partial<PublicSuomiFiRegistration | PublicEmailRegistration> & {
    examSessionId?: number;
    partialExamType?: PartialExamType;
    registrationKind?: RegistrationKind;
    expiresIn?: number;
  };
  activeStep: PublicRegistrationFormStep;
  showErrors: boolean;
  hasTimerExpired: boolean;
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
    countryCode: '246',
  },
  showErrors: false,
  hasTimerExpired: false,
  fetchRegistration: { status: APIResponseStatus.NotStarted },
};

const getRegistrationError = (
  response?: AxiosResponse,
): PublicRegistrationInitErrorState => {
  if (!response) {
    return {
      error: PublicRegistrationInitError.Generic,
    };
  } else {
    if (isRegistrationInitErrorResponse(response)) {
      const error = response.data.error;
      const { closed, full, partialFull } = error;
      if (closed) {
        return {
          error: PublicRegistrationInitError.Past,
        };
      } else if (error['other-exam-session-registration']) {
        return {
          error: PublicRegistrationInitError.AlreadyRegistered,
          otherExamSessionRegistration:
            error['other-exam-session-registration'],
        };
      } else if (partialFull) {
        return {
          error: PublicRegistrationInitError.ExamSessionPartialFull,
        };
      } else if (full) {
        return {
          error: PublicRegistrationInitError.ExamSessionFull,
        };
      } else {
        return {
          error: PublicRegistrationInitError.Generic,
        };
      }
    } else if (response.status === 401) {
      return {
        error: PublicRegistrationInitError.Unauthorized,
      };
    } else {
      return {
        error: PublicRegistrationInitError.Generic,
      };
    }
  }
};

const applyRegistrationDetails = (
  state: RegistrationState,
  details: PublicRegistrationDetails,
) => {
  state.registration.examSessionId = details.exam_session.id;
  state.registration.expiresIn = details?.expires_in;
  state.registration.partialExamType = details.partial_exam_type;

  const { registration_id, is_strongly_identified, user, registration_kind } =
    details;
  const nationality = user.nationalities && user.nationalities[0];
  state.registration.registrationKind = registration_kind;
  state.registration.id = registration_id;
  if (is_strongly_identified) {
    state.isEmailRegistration = false;
    state.hasSuomiFiNationalityData = !!nationality;
    state.registration = {
      ...state.registration,
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
      email: user.email,
    };
  }
};

const registrationSlice = createSlice({
  name: 'registrationV2/registration',
  initialState,
  reducers: {
    initRegistration(
      state,
      action: PayloadAction<PublicRegistrationInitPayload>,
    ) {
      Object.assign(state, initialState);
      state.initRegistration = { status: APIResponseStatus.InProgress };
      state.registration = {
        ...initialState.registration,
        examSessionId: action.payload.examSessionId,
        registrationKind: action.payload.registrationKind,
        partialExamType: action.payload.partialExamType,
      };
    },
    rejectPublicRegistrationInit(
      state,
      action: PayloadAction<AxiosResponse | undefined>,
    ) {
      state.initRegistration.status = APIResponseStatus.Error;
      state.initRegistration.error = getRegistrationError(action.payload);
      if (
        state.initRegistration.error.error ===
        PublicRegistrationInitError.Unauthorized
      ) {
        state.activeStep = PublicRegistrationFormStep.Identify;
      }
    },
    resetPublicRegistration() {
      return initialState;
    },
    acceptPublicRegistrationInit(
      state,
      action: PayloadAction<PublicRegistrationInitResponse>,
    ) {
      state.initRegistration = { status: APIResponseStatus.Success };
      state.registration.id = action.payload.registration_id;
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
      state.fetchRegistration = { status: APIResponseStatus.InProgress };
      state.registration.examSessionId = action.payload.examSessionId;
      state.registration.id = action.payload.registrationId;
    },
    rejectRegistrationDetails(
      state,
      action: PayloadAction<AxiosResponse | undefined>,
    ) {
      state.fetchRegistration = {
        status: APIResponseStatus.Error,
        error: getRegistrationError(action.payload),
      };
      if (
        state.fetchRegistration.error?.error ===
        PublicRegistrationInitError.Unauthorized
      ) {
        state.activeStep = PublicRegistrationFormStep.Identify;
      }
    },
    acceptFetchRegistrationDetails(
      state,
      action: PayloadAction<PublicRegistrationDetails>,
    ) {
      state.fetchRegistration = { status: APIResponseStatus.Success };
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
