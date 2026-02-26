import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkCustomerDetailsResponse,
  ClerkPersonContactUpdateRequest,
} from 'interfaces/clerkCustomer';
import {
  loadClerkCustomerDetails,
  rejectCustomerContactUpdate,
  rejectCustomerDetails,
  resolveCustomerContactUpdate,
  storeCustomerDetails,
  updateCustomerContactDetails,
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

function* updateCustomerContactDetailsSaga(
  action: PayloadAction<ClerkPersonContactUpdateRequest>,
) {
  try {
    yield call(
      axiosInstance.post,
      APIEndpoints.ClerkPersonContactUpdate.replace(/:oid/, action.payload.oid),
      action.payload,
    );
    yield put(resolveCustomerContactUpdate());
    yield put(loadClerkCustomerDetails(action.payload.oid));
  } catch (error) {
    yield put(rejectCustomerContactUpdate());
  }
}

export function* watchClerkCustomerDetails() {
  yield takeLatest(loadClerkCustomerDetails.type, loadClerkCustomerDetailsSaga);
  yield takeLatest(
    updateCustomerContactDetails.type,
    updateCustomerContactDetailsSaga,
  );
}
