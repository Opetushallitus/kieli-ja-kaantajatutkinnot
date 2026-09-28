import { call, put, select, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse, isAxiosError } from 'axios';
import { WithId } from 'shared/interfaces';

import axiosInstance from 'configs/axios';
import { getCurrentLang } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { RegistrationStates } from 'enums/app';
import { PublicFreeRegistrationDetails } from 'interfaces/publicFreeRegistration';
import { PublicRegistrationInitPayload } from 'interfaces/publicRegistration';
import {
  RegistrationContext,
  RegistrationKey,
  RegistrationSubmitErrorResponse,
} from 'interfaces/registrationContext';
import { resetExamSession, storeExamSession } from 'redux/reducers/examSession';
import { resetKoskiEducations } from 'redux/reducers/publicEducation';
import {
  resetPublicFreeRegistration,
  setPublicFreeRegistration,
} from 'redux/reducers/publicFreeRegistration';
import {
  acceptCancelRegistration,
  acceptFetchRegistrationDetails,
  acceptPublicRegistrationInit,
  acceptPublicRegistrationSubmission,
  cancelRegistration,
  fetchRegistrationDetails,
  initRegistration,
  RegistrationState,
  rejectCancelRegistration,
  rejectPublicRegistrationInit,
  rejectPublicRegistrationSubmission,
  rejectRegistrationDetails,
  resetPublicRegistration,
  submitPublicRegistration,
} from 'redux/reducers/registration';
import { acceptSession, resetSession } from 'redux/reducers/session';
import { resetUserOpenRegistrations } from 'redux/reducers/userOpenRegistrations';
import { nationalitiesSelector } from 'redux/selectors/nationalities';
import { publicFreeRegistrationSelector } from 'redux/selectors/publicFreeRegistration';
import { registrationSelector } from 'redux/selectors/registration';
import {
  cancelRegistrationRequest,
  getRegistrationDetails,
  initRegistrationRequest,
  submitRegistrationRequest,
} from 'utils/registrationApi';
import { SerializationUtils } from 'utils/serialization';

function* storeContextDetails(data: RegistrationContext) {
  yield put(
    storeExamSession(
      SerializationUtils.deserializeExamSessionResponse({
        ...data.exam_session,
        available_registration_kind: data.registration_kind,
      }),
    ),
  );
  yield put(acceptSession(data.session));
  if (data.state !== RegistrationStates.Started) {
    yield put(
      setPublicFreeRegistration({ isFree: data.is_free ? 'YES' : 'NO' }),
    );
  }
}

function* initRegistrationSaga(
  action: PayloadAction<PublicRegistrationInitPayload>,
) {
  try {
    yield put(resetPublicFreeRegistration());
    yield put(resetKoskiEducations());
    const { data }: AxiosResponse<RegistrationContext> = yield call(
      initRegistrationRequest,
      action.payload,
    );
    yield call(storeContextDetails, data);
    yield put(acceptPublicRegistrationInit(data));
  } catch (error) {
    yield put(
      rejectPublicRegistrationInit(
        isAxiosError(error) ? error.response : undefined,
      ),
    );
    if (isAxiosError(error) && error.response?.status === 401)
      yield put(resetSession());
  }
}

function* fetchRegistrationDetailsSaga(action: PayloadAction<RegistrationKey>) {
  try {
    const { data }: AxiosResponse<RegistrationContext> = yield call(
      getRegistrationDetails,
      action.payload,
    );
    yield call(storeContextDetails, data);
    yield put(acceptFetchRegistrationDetails(data));
  } catch (error) {
    yield put(rejectRegistrationDetails());
    yield put(
      rejectPublicRegistrationInit(
        isAxiosError(error) ? error.response : undefined,
      ),
    );
    if (isAxiosError(error) && error.response?.status === 401)
      yield put(resetSession());
  }
}

function* submitRegistrationFormSaga() {
  const { context, registration }: RegistrationState =
    yield select(registrationSelector);
  if (!context) return;
  try {
    const { nationalities } = yield select(nationalitiesSelector);
    const { basis, isFree }: PublicFreeRegistrationDetails = yield select(
      publicFreeRegistrationSelector,
    );
    let freeRegistrationId: number | undefined;
    if (context.is_strongly_identified && isFree === 'YES' && basis) {
      const response: AxiosResponse<WithId> = yield call(
        axiosInstance.post,
        APIEndpoints.PublicFreeRegistrationEducation.replace(
          ':registrationId',
          String(context.registration_id),
        ),
        JSON.stringify({ basis }),
      );
      freeRegistrationId = response.data.id;
    }
    const { data }: AxiosResponse<RegistrationContext> = yield call(
      submitRegistrationRequest,
      {
        examSessionId: context.exam_session.id,
        registrationId: context.registration_id,
      },
      {
        ...SerializationUtils.serializeRegistrationForm(
          registration,
          nationalities,
        ),
        lang: SerializationUtils.serializeAppLanguage(getCurrentLang()),
        ...(freeRegistrationId
          ? { free_registration_id: freeRegistrationId }
          : {}),
      },
    );
    yield call(storeContextDetails, data);
    yield put(acceptPublicRegistrationSubmission(data));
    yield put(resetUserOpenRegistrations());
  } catch (error) {
    if (
      isAxiosError<RegistrationSubmitErrorResponse>(error) &&
      error.response?.status === 401
    ) {
      yield put(resetSession());
      yield put(rejectPublicRegistrationInit(error.response));
      yield put(rejectPublicRegistrationSubmission({ error: {} }));
    } else {
      yield put(
        rejectPublicRegistrationSubmission(
          isAxiosError<RegistrationSubmitErrorResponse>(error) &&
            error.response?.data?.error
            ? error.response.data
            : { error: {} },
        ),
      );
    }
  }
}

function* cancelRegistrationSaga() {
  const { context }: RegistrationState = yield select(registrationSelector);
  if (!context) return;
  try {
    yield call(cancelRegistrationRequest, {
      examSessionId: context.exam_session.id,
      registrationId: context.registration_id,
    });
    yield put(acceptCancelRegistration());
    yield put(resetPublicRegistration());
    yield put(resetPublicFreeRegistration());
    yield put(resetExamSession());
    yield put(resetUserOpenRegistrations());
  } catch (error) {
    yield put(rejectCancelRegistration());
    if (isAxiosError(error) && error.response?.status === 401)
      yield put(resetSession());
  }
}

export function* watchRegistration() {
  yield takeLatest(initRegistration.type, initRegistrationSaga);
  yield takeLatest(fetchRegistrationDetails.type, fetchRegistrationDetailsSaga);
  yield takeLatest(submitPublicRegistration.type, submitRegistrationFormSaga);
  yield takeLatest(cancelRegistration.type, cancelRegistrationSaga);
}
