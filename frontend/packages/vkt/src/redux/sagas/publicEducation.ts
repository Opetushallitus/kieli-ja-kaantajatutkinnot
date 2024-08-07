import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicEducationResponse } from 'interfaces/publicEducation';
import { setAPIError } from 'redux/reducers/APIError';
import {
  loadPublicEducation,
  rejectPublicEducation,
  storePublicEducation,
} from 'redux/reducers/publicEducation';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* loadPublicEducationSaga() {
  try {
    const loadUrl = `${APIEndpoints.PublicEducation}`;
    const response: AxiosResponse<Array<PublicEducationResponse>> = yield call(
      axiosInstance.get,
      loadUrl,
    );

    const publicEducation = SerializationUtils.deserializePublicEducation(
      response.data,
    );

    yield put(storePublicEducation(publicEducation));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicEducation());
  }
}

export function* watchPublicEducation() {
  yield takeLatest(loadPublicEducation, loadPublicEducationSaga);
}
