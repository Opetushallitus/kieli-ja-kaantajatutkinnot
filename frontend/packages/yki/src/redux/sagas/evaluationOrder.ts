import { AxiosResponse } from 'axios';
import { call, put, select, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { getCurrentLang, translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  EvaluationOrderResponse,
  EvaluationPaymentRedirectResponse,
} from 'interfaces/evaluationOrder';
import { setAPIError } from 'redux/reducers/APIError';
import {
  acceptEvaluationOrder,
  EvaluationOrderState,
  rejectEvaluationOrder,
  submitEvaluationOrder,
} from 'redux/reducers/evaluationOrder';
import { evaluationOrderSelector } from 'redux/selectors/evaluationOrder';
import { SerializationUtils } from 'utils/serialization';

function* submitEvaluationOrderSaga() {
  const t = translateOutsideComponent();
  try {
    const evaluationOrder: EvaluationOrderState = yield select(
      evaluationOrderSelector
    );
    const lang = getCurrentLang();
    const response: AxiosResponse<EvaluationOrderResponse> = yield call(
      axiosInstance.post,
      APIEndpoints.EvaluationOrder.replace(
        /:evaluationId/,
        `${evaluationOrder.evaluationPeriod?.id}`
      ),
      JSON.stringify(
        SerializationUtils.serializeEvaluationOrder(evaluationOrder)
      ),
      { params: { lang: SerializationUtils.serializeAppLanguage(lang) } }
    );
    // TODO This feels like an extra step. Could we instead just return the redirect url as response to POSTing the evaluation order form?
    const { evaluation_order_id, signature } = response.data;
    const redirectResponse: AxiosResponse<EvaluationPaymentRedirectResponse> =
      yield call(
        axiosInstance.get,
        APIEndpoints.EvaluationPaymentRedirect.replace(
          /:evaluationOrderId/,
          `${evaluation_order_id}`
        ),
        { params: { signature } }
      );
    yield put(acceptEvaluationOrder(redirectResponse.data));
  } catch (error) {
    yield put(rejectEvaluationOrder());
    yield put(setAPIError(t('yki.common.error')));
  }
}

export function* watchEvaluationOrder() {
  yield takeLatest(submitEvaluationOrder.type, submitEvaluationOrderSaga);
}
