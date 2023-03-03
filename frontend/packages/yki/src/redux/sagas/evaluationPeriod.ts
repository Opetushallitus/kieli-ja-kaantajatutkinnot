import { call, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  EvaluationPeriodResponse,
  EvaluationPeriodsResponse,
} from 'interfaces/evaluationPeriod';
import { setAPIError } from 'redux/reducers/APIError';
import {
  loadEvaluationPeriod,
  rejectEvaluationPeriod,
  storeEvaluationPeriod,
} from 'redux/reducers/evaluationOrder';
import {
  loadEvaluationPeriods,
  rejectEvaluationPeriods,
  storeEvaluationPeriods,
} from 'redux/reducers/evaluationPeriods';
import { SerializationUtils } from 'utils/serialization';

function* loadEvaluationPeriodSaga(action: PayloadAction<number>) {
  const t = translateOutsideComponent();
  try {
    const response: AxiosResponse<EvaluationPeriodResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.Evaluation.replace(/:evaluationId/, `${action.payload}`)
    );

    yield put(
      storeEvaluationPeriod(
        SerializationUtils.deserializeEvaluationPeriodResponse(response.data)
      )
    );
  } catch (error) {
    yield put(rejectEvaluationPeriod());
    yield put(setAPIError(t('yki.common.error')));
  }
}

function* loadEvaluationPeriodsSaga() {
  const t = translateOutsideComponent();
  try {
    const response: AxiosResponse<EvaluationPeriodsResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.Evaluations
    );

    yield put(
      storeEvaluationPeriods(
        SerializationUtils.deserializeEvaluationPeriodsResponse(response.data)
      )
    );
  } catch (error) {
    yield put(rejectEvaluationPeriods());
    yield put(setAPIError(t('yki.common.error')));
  }
}

export function* watchEvaluationPeriods() {
  yield takeLatest(loadEvaluationPeriods.type, loadEvaluationPeriodsSaga);
  yield takeLatest(loadEvaluationPeriod.type, loadEvaluationPeriodSaga);
}
