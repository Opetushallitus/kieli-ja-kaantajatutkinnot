import { call, put, select, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse, isAxiosError } from 'axios';
import { WithId } from 'shared/interfaces';

import axiosInstance from 'configs/axios';
import { getCurrentLang } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { AppRoutes, RegistrationKind } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { PublicFreeRegistrationDetails } from 'interfaces/publicFreeRegistration';
import {
  PublicRegistrationFormSubmitErrorResponse,
  PublicRegistrationFormSubmitSuccessResponse,
  PublicRegistrationInitErrorResponse,
  PublicRegistrationInitPayload,
  PublicRegistrationInitResponse,
  RegistrationDetailsResponse,
} from 'interfaces/publicRegistration';
import { resetExamSession, storeExamSession } from 'redux/reducers/examSession';
import {
  acceptCancelRegistration,
  acceptFetchRegistrationDetails,
  acceptPublicRegistrationInit,
  acceptPublicRegistrationSubmission,
  cancelRegistration,
  fetchRegistrationDetails,
  identifyRegistration,
  initRegistration,
  RegistrationState,
  rejectCancelRegistration,
  rejectPublicRegistrationInit,
  rejectPublicRegistrationSubmission,
  resetPublicRegistration,
  setActiveStep,
  submitPublicRegistration,
} from 'redux/reducers/registration';
import { resetSession } from 'redux/reducers/session';
import { resetUserOpenRegistrations } from 'redux/reducers/userOpenRegistrations';
import { nationalitiesSelector } from 'redux/selectors/nationalities';
import { publicFreeRegistrationSelector } from 'redux/selectors/publicFreeRegistration';
import { registrationSelector } from 'redux/selectors/registration';
import { SerializationUtils } from 'utils/serialization';

function* initRegistrationSaga(
  action: PayloadAction<PublicRegistrationInitPayload>,
) {
  try {
    const response: AxiosResponse<PublicRegistrationInitResponse> = yield call(
      axiosInstance.post,
      APIEndpoints.InitRegistration,
      JSON.stringify(
        SerializationUtils.serializePublicRegistrationInitRequest(
          action.payload,
        ),
      ),
    );
    const { data } = response;
    yield put(
      storeExamSession(
        SerializationUtils.deserializeExamSessionResponse({
          ...data.exam_session,
          available_registration_kind: data.registration_kind,
        }),
      ),
    );
    yield put(acceptPublicRegistrationInit(data));
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const response =
        error.response as AxiosResponse<PublicRegistrationInitErrorResponse>;
      yield put(rejectPublicRegistrationInit(response));
      if (response.status === 401) {
        yield put(resetSession());
      }
    } else {
      yield put(rejectPublicRegistrationInit());
    }
  }
}

function* identifyRegistrationSaga(
  action: PayloadAction<PublicRegistrationInitPayload>,
) {
  try {
    const response: AxiosResponse<PublicRegistrationInitResponse> = yield call(
      axiosInstance.post,
      APIEndpoints.IdentifyRegistration,
      JSON.stringify(
        SerializationUtils.serializePublicRegistrationInitRequest(
          action.payload,
        ),
      ),
    );
    const { data } = response;
    yield put(
      storeExamSession(
        SerializationUtils.deserializeExamSessionResponse(data.exam_session),
      ),
    );
    yield put(acceptPublicRegistrationInit(data));
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const response =
        error.response as AxiosResponse<PublicRegistrationInitErrorResponse>;
      yield put(rejectPublicRegistrationInit(response));
      if (response.status === 401) {
        yield put(resetSession());
      }
    } else {
      yield put(rejectPublicRegistrationInit());
    }
  }
}

function* submitRegistrationFormSaga() {
  try {
    const lang = getCurrentLang();
    const registrationState: RegistrationState =
      yield select(registrationSelector);
    const { nationalities } = yield select(nationalitiesSelector);
    const { basis, isFree }: PublicFreeRegistrationDetails = yield select(
      publicFreeRegistrationSelector,
    );
    if (isFree === 'YES' && basis) {
      const registrationEducationEndpoint =
        APIEndpoints.PublicFreeRegistrationEducation.replace(
          /:registrationId/,
          `${registrationState.registration.id}`,
        );
      const freeRegistrationResponse: AxiosResponse<WithId> = yield call(
        axiosInstance.post,
        registrationEducationEndpoint,
        JSON.stringify({ basis }),
      );
      const response: AxiosResponse<PublicRegistrationFormSubmitSuccessResponse> =
        yield call(
          axiosInstance.post,
          APIEndpoints.SubmitRegistration.replace(
            /:registrationId/,
            `${registrationState.registration.id}`,
          ),
          JSON.stringify({
            ...SerializationUtils.serializeRegistrationForm(
              registrationState.registration,
              nationalities,
            ),
            free_registration_id: freeRegistrationResponse.data.id,
          }),
          {
            params: {
              lang: SerializationUtils.serializeAppLanguage(lang),
            },
          },
        );
      if (response.data.registration_kind === RegistrationKind.Queue) {
        // Free queued registration -> just display screen instructing user to observe their emails in case they get lifted from queue
        yield put(acceptPublicRegistrationSubmission(response.data));
      } else {
        // In case of free registration with kind Admission, user is admitted directly to the exam
        // Redirect user to a separate page welcoming them to the exam.
        window.location.href = AppRoutes.FreeRegistrationSuccess.replace(
          /:examSessionId/,
          `${registrationState.initRegistration.examSessionId}`,
        ).replace(/:registrationId/, `${registrationState.registration.id}`);
      }
      yield put(resetUserOpenRegistrations());
    } else {
      const response: AxiosResponse<PublicRegistrationFormSubmitSuccessResponse> =
        yield call(
          axiosInstance.post,
          APIEndpoints.SubmitRegistration.replace(
            /:registrationId/,
            `${registrationState.registration.id}`,
          ),
          JSON.stringify(
            SerializationUtils.serializeRegistrationForm(
              registrationState.registration,
              nationalities,
            ),
          ),
          {
            params: {
              lang: SerializationUtils.serializeAppLanguage(lang),
            },
          },
        );
      yield put(acceptPublicRegistrationSubmission(response.data));
      yield put(resetUserOpenRegistrations());
    }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const response =
        error.response as AxiosResponse<PublicRegistrationFormSubmitErrorResponse>;

      if (response.data && response.data.error) {
        yield put(rejectPublicRegistrationSubmission(response.data));
      } else if (response.status === 401) {
        // Session expired before submission -> redirect user to selecting identification method
        yield put(resetSession());
        yield put(resetPublicRegistration());
        yield put(rejectPublicRegistrationInit(response));
        yield put(setActiveStep(PublicRegistrationFormStep.Identify));
      } else {
        yield put(rejectPublicRegistrationSubmission({ error: {} }));
      }
    } else {
      yield put(rejectPublicRegistrationSubmission({ error: {} }));
    }
  }
}

function* fetchRegistrationDetailsSaga(action: PayloadAction<number>) {
  try {
    const response: AxiosResponse<RegistrationDetailsResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.Registration.replace(/:registrationId/, `${action.payload}`),
    );
    yield put(acceptFetchRegistrationDetails(response.data));
  } catch {
    // Silently fail - partialExamType will be set when identify saga completes
  }
}

function* cancelRegistrationSaga() {
  try {
    const { registration }: RegistrationState =
      yield select(registrationSelector);
    yield call(
      axiosInstance.delete,
      APIEndpoints.Registration.replace(
        /:registrationId/,
        `${registration.id}`,
      ),
    );
    yield put(acceptCancelRegistration());
    yield put(resetPublicRegistration());
    yield put(resetExamSession());
    yield put(resetUserOpenRegistrations());
  } catch (error) {
    yield put(rejectCancelRegistration());
    if (isAxiosError(error) && error.response?.status === 401) {
      yield put(resetSession());
    }
  }
}

export function* watchRegistration() {
  yield takeLatest(initRegistration.type, initRegistrationSaga);
  yield takeLatest(identifyRegistration.type, identifyRegistrationSaga);
  yield takeLatest(fetchRegistrationDetails.type, fetchRegistrationDetailsSaga);
  yield takeLatest(submitPublicRegistration.type, submitRegistrationFormSaga);
  yield takeLatest(cancelRegistration.type, cancelRegistrationSaga);
}
