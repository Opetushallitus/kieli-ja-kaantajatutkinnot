import { AxiosError } from 'axios';
import { put, takeLatest } from 'redux-saga/effects';

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
    // Temporarily return empty public education data to allow testing attachment upload functionality in production
    const response = { data: [] };
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
