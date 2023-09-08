import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkPerson } from 'interfaces/clerkPerson';
import { setAPIError } from 'redux/reducers/APIError';
import {
  rejectClerkPersonSearch,
  searchClerkPerson,
  storeClerkPersonSearch,
} from 'redux/reducers/clerkPersonSearch';
import { NotifierUtils } from 'utils/notifier';

function* searchClerkPersonSaga(action: PayloadAction<string>) {
  console.log('========> searchClerkPersonSaga()');
  try {
    const response: AxiosResponse<ClerkPerson> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkPersonSearch,
      {
        params: {
          identityNumber: action.payload,
        },
      }
    );
    const clerkPerson = response.data ? response.data : undefined;

    yield put(storeClerkPersonSearch(clerkPerson));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkPersonSearch());
  }
}

export function* watchClerkPersonSearch() {
  yield takeLatest(searchClerkPerson.type, searchClerkPersonSaga);
}
