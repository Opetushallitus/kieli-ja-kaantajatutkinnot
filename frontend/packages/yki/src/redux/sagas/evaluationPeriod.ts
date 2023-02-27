import { call, put, takeLatest } from '@redux-saga/core/effects';
import { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { EvaluationPeriodsResponse } from 'interfaces/evaluationPeriod';
import { setAPIError } from 'redux/reducers/APIError';
import {
  loadEvaluationPeriods,
  rejectEvaluationPeriods,
  storeEvaluationPeriods,
} from 'redux/reducers/evaluationPeriod';
import { SerializationUtils } from 'utils/serialization';

function* loadEvaluationPeriodsSaga() {
  const t = translateOutsideComponent();
  try {
    const response: AxiosResponse<EvaluationPeriodsResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.Evaluation
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
}
