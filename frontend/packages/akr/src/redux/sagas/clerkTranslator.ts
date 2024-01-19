import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkStateResponse } from 'interfaces/clerkState';
import {
  loadClerkTranslators,
  rejectClerkTranslators,
  storeClerkTranslators,
} from 'redux/reducers/clerkTranslator';
import { storeExaminationDates } from 'redux/reducers/examinationDate';
import { storeMeetingDates } from 'redux/reducers/meetingDate';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkTranslatorsSaga() {
  try {
    const apiResponse: AxiosResponse<ClerkStateResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkTranslator,
    );
    const { translators, langs, meetingDates, examinationDates } =
      SerializationUtils.deserializeClerkTranslators(apiResponse.data);

    yield put(storeClerkTranslators({ translators, langs }));
    yield put(storeExaminationDates(examinationDates));
    yield put(storeMeetingDates(meetingDates));
  } catch (error) {
    yield put(rejectClerkTranslators());
  }
}

export function* watchClerkTranslators() {
  yield takeLatest(loadClerkTranslators.type, loadClerkTranslatorsSaga);
}
