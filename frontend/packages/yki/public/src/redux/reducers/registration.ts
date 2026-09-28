import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { APIResponseStatus } from 'shared/enums';

import { RegistrationKind, RegistrationStates } from 'enums/app';
import {
  PublicRegistrationFormStep,
  PublicRegistrationFormSubmitError,
  PublicRegistrationInitError,
} from 'enums/publicRegistration';
import {
  isRegistrationInitErrorResponse,
  PartialExamType,
  PublicEmailRegistration,
  PublicRegistrationFormSubmitErrorResponse,
  PublicRegistrationInitErrorState,
  PublicRegistrationInitPayload,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';
import {
  RegistrationContext,
  RegistrationKey,
} from 'interfaces/registrationContext';

export interface RegistrationState {
  context?: RegistrationContext;
  requestedRegistration?: RegistrationKey;
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

const acceptContext = (
  state: RegistrationState,
  action: PayloadAction<RegistrationContext>,
) => {
  const context = action.payload;
  const previous = state.context;
  const sameRegistration =
    previous?.registration_id === context.registration_id &&
    previous?.exam_session.id === context.exam_session.id;
  const sameIdentity =
    sameRegistration &&
    JSON.stringify(previous?.session.identity) ===
      JSON.stringify(context.session.identity);
  state.context = context;
  state.initRegistration = {
    status: APIResponseStatus.Success,
    examSessionId: context.exam_session.id,
    registrationId: context.registration_id,
    registrationKind: context.registration_kind,
    partialExamType: context.partial_exam_type,
    expiresIn: context.expires_in,
  };
  state.fetchRegistrationStatus = APIResponseStatus.Success;
  state.hasTimerExpired = context.state === RegistrationStates.Expired;
  if (!sameIdentity) {
    const { user, registration_id, is_strongly_identified } = context;
    const nationality = user.nationalities?.[0];
    state.isEmailRegistration = !is_strongly_identified;
    state.hasSuomiFiNationalityData = is_strongly_identified && !!nationality;
    state.registration = {
      ...initialState.registration,
      id: registration_id,
      ...(is_strongly_identified
        ? {
            firstNames: user.first_name,
            lastName: user.last_name,
            hasSSN: !!user.ssn,
            ssn: user.ssn,
            nationality,
            address: user.street_address,
            postNumber: user.zip,
            postOffice: user.post_office,
          }
        : { email: user.email }),
    };
    state.showErrors = false;
  }
  const submitted = [
    RegistrationStates.Submitted,
    RegistrationStates.Completed,
  ].includes(context.state);
  state.submitRegistration = submitted
    ? {
        status: APIResponseStatus.Success,
        registrationKind: context.registration_kind,
        finalState: context.state,
      }
    : { status: APIResponseStatus.NotStarted };
  if (context.state === RegistrationStates.Expired) {
    state.submitRegistration = {
      status: APIResponseStatus.Error,
      error: PublicRegistrationFormSubmitError.FormExpired,
    };
  } else if (
    [
      RegistrationStates.Cancelled,
      RegistrationStates.PaidAndCancelled,
      RegistrationStates.Unknown,
    ].includes(context.state)
  ) {
    state.initRegistration.status = APIResponseStatus.Error;
    state.initRegistration.error = {
      error: PublicRegistrationInitError.Generic,
    };
  }
};

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    initRegistration(
      state,
      action: PayloadAction<PublicRegistrationInitPayload>,
    ) {
      Object.assign(state, initialState);
      state.context = undefined;
      state.requestedRegistration = undefined;
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
    acceptPublicRegistrationInit: acceptContext,
    setShowErrors(state, action: PayloadAction<boolean>) {
      state.showErrors = action.payload;
    },
    submitPublicRegistration(state) {
      state.submitRegistration.status = APIResponseStatus.InProgress;
      state.submitRegistration.error = undefined;
    },
    acceptPublicRegistrationSubmission: acceptContext,
    rejectPublicRegistrationSubmission(
      state,
      action: PayloadAction<PublicRegistrationFormSubmitErrorResponse>,
    ) {
      state.submitRegistration.status = APIResponseStatus.Error;
      state.submitRegistration.error = undefined;
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
      state.requestedRegistration = action.payload;
      state.initRegistration.examSessionId = action.payload.examSessionId;
      state.initRegistration.registrationId = action.payload.registrationId;
    },
    rejectRegistrationDetails(state) {
      state.fetchRegistrationStatus = APIResponseStatus.Error;
    },
    acceptFetchRegistrationDetails: acceptContext,
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
