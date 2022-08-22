import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkPerson } from 'interfaces/clerkPerson';
import {
  rejectClerkPersonSearch,
  searchClerkPerson,
  storeClerkPersonSearch,
} from 'redux/reducers/clerkPersonSearch';
import { showNotifierToast } from 'redux/reducers/notifier';
import { NotifierUtils } from 'utils/notifier';

function* searchClerkPersonSaga(action: PayloadAction<string>) {
  try {
    const response: AxiosResponse<ClerkPerson> = yield call(
      axiosInstance.get,
      `${APIEndpoints.ClerkPersonSearch}/?identityNumber=${action.payload}`
    );
    const clerkPerson = response.data ? response.data : undefined;

    yield put(storeClerkPersonSearch(clerkPerson));
  } catch (error) {
    yield put(rejectClerkPersonSearch());
    yield put(
      showNotifierToast(
        NotifierUtils.createAxiosErrorNotifierToast(error as AxiosError)
      )
    );
  }
}

export function* watchClerkPersonSearch() {
  yield takeLatest(searchClerkPerson, searchClerkPersonSaga);
}
