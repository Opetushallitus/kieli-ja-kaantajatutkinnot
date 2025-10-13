import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkCustomerDetails } from 'interfaces/clerkCustomer';
import {
  loadClerkCustomerDetails,
  rejectCustomerDetails,
  storeCustomerDetails,
} from 'redux/reducers/clerkCustomerDetails';

function* loadClerkCustomerDetailsSaga(action: PayloadAction<number>) {
  try {
    const response: AxiosResponse<ClerkCustomerDetails> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkCustomerDetails.replace(/:id$/, `${action.payload}`),
    );
    yield put(storeCustomerDetails(response.data));
  } catch (error) {
    yield put(rejectCustomerDetails());
  }
}

export function* watchClerkCustomerDetails() {
  yield takeLatest(loadClerkCustomerDetails.type, loadClerkCustomerDetailsSaga);
}
