import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { APIResponseStatus } from 'shared/enums';

import { RegistrationKind, RegistrationStates } from 'enums/app';
import {
  PublicRegistrationFormStep,
  PublicRegistrationFormSubmitError,
  PublicRegistrationInitError,
} from 'enums/publicRegistration';
import {
  RegistrationContext,
  RegistrationKey,
  RegistrationStep,
  RegistrationSubmitErrorResponse,
} from 'features/registration/modelv2';
import {
  isRegistrationInitErrorResponse,
  PartialExamType,
  PublicEmailRegistration,
  PublicRegistrationFormSubmitSuccessResponse,
  PublicRegistrationInitErrorState,
  PublicRegistrationInitPayload,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';

export interface RegistrationState {
  context?: RegistrationContext;
  requestKey?: string;
  requestedStep?: RegistrationStep;
  loadError?: 'session' | 'unavailable' | 'network' | 'contract';
  startNavigation: boolean;
  initRegistration: {
    status: APIResponseStatus;
    error?: Omit<
      PublicRegistrationInitErrorState,
      'otherExamSessionRegistration'
    > & {
      otherExamSessionRegistration?: {
        id: number;
        registration_id: number;
        state: RegistrationStates;
        partial_exam_type?: PartialExamType;
        kind?: RegistrationKind;
      };
    };
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
  startNavigation: false,
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

const registrationSlice = createSlice({
  name: 'registrationV2',
  initialState,
  reducers: {
    startRegistration(
      state,
      action: PayloadAction<PublicRegistrationInitPayload>,
    ) {
      return {
        ...initialState,
        startNavigation: true,
        initRegistration: {
          status: APIResponseStatus.InProgress,
          ...action.payload,
        },
      };
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
      action: PayloadAction<RegistrationContext>,
    ) {
      const sameRegistration =
        state.context?.registration_id === action.payload.registration_id &&
        state.context?.is_strongly_identified ===
          action.payload.is_strongly_identified &&
        state.context?.user.email === action.payload.user.email &&
        state.context?.user['external-user-id'] ===
          action.payload.user['external-user-id'];
      state.context = action.payload;
      state.fetchRegistrationStatus = APIResponseStatus.Success;
      state.initRegistration.examSessionId = action.payload.exam_session.id;
      if (!sameRegistration) {
        state.registration = initialState.registration;
        state.hasTimerExpired = false;
        state.showErrors = false;
        state.submitRegistration = initialState.submitRegistration;
        state.cancelRegistration = initialState.cancelRegistration;
      }
      state.initRegistration.status = APIResponseStatus.Success;
      state.initRegistration.expiresIn = action.payload?.expires_in;
      state.initRegistration.partialExamType = action.payload.partial_exam_type;

      const {
        registration_id,
        is_strongly_identified,
        user,
        registration_kind,
      } = action.payload;
      const nationality = user.nationalities && user.nationalities[0];
      state.initRegistration.registrationKind = registration_kind;
      state.initRegistration.registrationId = registration_id;
      if (sameRegistration) return;
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
    },
    setShowErrors(state, action: PayloadAction<boolean>) {
      state.showErrors = action.payload;
    },
    startSubmission(state) {
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
      action: PayloadAction<RegistrationSubmitErrorResponse>,
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
    startCancellation(state) {
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
    loadStep(
      state,
      action: PayloadAction<
        RegistrationKey & { requestKey: string; step: RegistrationStep }
      >,
    ) {
      state.requestKey = action.payload.requestKey;
      state.requestedStep = action.payload.step;
      state.fetchRegistrationStatus = APIResponseStatus.InProgress;
      state.loadError = undefined;
      state.startNavigation = false;
    },
    rejectStep(
      state,
      action: PayloadAction<'session' | 'unavailable' | 'network' | 'contract'>,
    ) {
      state.fetchRegistrationStatus = APIResponseStatus.Error;
      state.loadError = action.payload;
    },
    navigationHandled(state) {
      state.startNavigation = false;
    },
  },
});

export const registrationReducer = registrationSlice.reducer;
export const {
  acceptPublicRegistrationInit,
  acceptPublicRegistrationSubmission,
  increaseActiveStep,
  startRegistration,
  rejectPublicRegistrationInit,
  rejectPublicRegistrationSubmission,
  resetPublicRegistration,
  setActiveStep,
  setShowErrors,
  startSubmission,
  updatePublicRegistration,
  startCancellation,
  acceptCancelRegistration,
  rejectCancelRegistration,
  setHasTimerExpired,
  loadStep,
  rejectStep,
  navigationHandled,
} = registrationSlice.actions;

// Only accepted commands mutate state. A repeated click cannot reset a pending selection.
export const initRegistration = createAction<PublicRegistrationInitPayload>(
  'registrationV2/init',
);
export const submitPublicRegistration = createAction('registrationV2/submit');
export const cancelRegistration = createAction('registrationV2/cancel');

export const requestStep = createAction<
  RegistrationKey & { requestKey: string; step: RegistrationStep }
>('registrationV2/requestStep');
