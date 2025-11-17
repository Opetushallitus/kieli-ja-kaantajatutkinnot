import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkCustomerDetailsResponse } from 'interfaces/clerkCustomer';
import {
  loadClerkCustomerDetails,
  rejectCustomerDetails,
  storeCustomerDetails,
} from 'redux/reducers/clerkCustomerDetails';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkCustomerDetailsSaga(action: PayloadAction<string>) {
  try {
    const response: AxiosResponse<ClerkCustomerDetailsResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkCustomerDetails.replace(/:oid$/, action.payload),
    );
    const clerkCustomerDetails =
      SerializationUtils.deserializeClerkCustomerDetailsResponse(response.data);

    yield put(storeCustomerDetails(clerkCustomerDetails));
  } catch (error) {
    yield put(rejectCustomerDetails());
  }
}

export function* watchClerkCustomerDetails() {
  yield takeLatest(loadClerkCustomerDetails.type, loadClerkCustomerDetailsSaga);
}
