import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, select, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { getCurrentLang, translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  EvaluationOrderDetailsResponse,
  EvaluationOrderResponse,
} from 'interfaces/evaluationOrder';
import { setAPIError } from 'redux/reducers/APIError';
import {
  acceptEvaluationOrder,
  acceptEvaluationOrderDetails,
  EvaluationOrderState,
  loadEvaluationOrderDetails,
  rejectEvaluationOrder,
  rejectEvaluationOrderDetails,
  submitEvaluationOrder,
} from 'redux/reducers/evaluationOrder';
import { evaluationOrderSelector } from 'redux/selectors/evaluationOrder';
import { SerializationUtils } from 'utils/serialization';

function* submitEvaluationOrderSaga() {
  const t = translateOutsideComponent();
  try {
    const evaluationOrder: EvaluationOrderState = yield select(
      evaluationOrderSelector,
    );
    const lang = getCurrentLang();
    const response: AxiosResponse<EvaluationOrderResponse> = yield call(
      axiosInstance.post,
      APIEndpoints.EvaluationOrder.replace(
        /:evaluationId/,
        `${evaluationOrder.evaluationPeriod?.id}`,
      ),
      JSON.stringify(
        SerializationUtils.serializeEvaluationOrder(evaluationOrder),
      ),
      {
        params: {
          lang: SerializationUtils.serializeAppLanguage(lang),
          'use-yki-ui': true,
        },
      },
    );

    yield put(acceptEvaluationOrder(response.data.redirect));
  } catch (error) {
    yield put(rejectEvaluationOrder());
    yield put(setAPIError(t('yki.common.error')));
  }
}

function* loadEvaluationOrderDetailsSaga(action: PayloadAction<number>) {
  try {
    const lang = getCurrentLang();
    const id = action.payload;
    const response: AxiosResponse<EvaluationOrderDetailsResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.EvaluationOrderDetails.replace(
        /:evaluationOrderId/,
        `${id}`,
      ),
      { params: { lang: SerializationUtils.serializeAppLanguage(lang) } },
    );
    yield put(
      acceptEvaluationOrderDetails(
        SerializationUtils.deserializeEvaluationOrderDetailsResponse(
          response.data,
        ),
      ),
    );
  } catch (error) {
    yield put(rejectEvaluationOrderDetails());
  }
}

export function* watchEvaluationOrder() {
  yield takeLatest(submitEvaluationOrder.type, submitEvaluationOrderSaga);
  yield takeLatest(
    loadEvaluationOrderDetails.type,
    loadEvaluationOrderDetailsSaga,
  );
}
