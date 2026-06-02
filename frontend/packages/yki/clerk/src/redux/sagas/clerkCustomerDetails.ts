import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkCustomerDetailsResponse,
  ClerkPersonContactUpdateRequest,
  OrganizerPersonContactUpdateRequest,
} from 'interfaces/clerkCustomer';
import {
  loadClerkCustomerDetails,
  loadOrganizerCustomerDetails,
  rejectCustomerContactUpdate,
  rejectCustomerDetails,
  resolveCustomerContactUpdate,
  storeCustomerDetails,
  updateCustomerContactDetails,
  updateOrganizerCustomerContactDetails,
} from 'redux/reducers/clerkCustomerDetails';
import { SerializationUtils } from 'utils/serialization';

function* loadOrganizerCustomerDetailsSaga(
  action: PayloadAction<{ oid: string; personOid: string }>,
) {
  try {
    const { oid, personOid } = action.payload;
    const response: AxiosResponse<ClerkCustomerDetailsResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.OrganizerCustomersDetails.replace(':oid', oid).replace(
        /:personOid$/,
        personOid,
      ),
    );
    const clerkCustomerDetails =
      SerializationUtils.deserializeClerkCustomerDetailsResponse(response.data);

    yield put(storeCustomerDetails(clerkCustomerDetails));
  } catch (error) {
    yield put(rejectCustomerDetails());
  }
}

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

function* updateOrganizerCustomerContactDetailsSaga(
  action: PayloadAction<OrganizerPersonContactUpdateRequest>,
) {
  try {
    yield call(
      axiosInstance.post,
      APIEndpoints.OrganizerCustomersDetails.replace(
        /:oid/,
        action.payload.organizerOid,
      ).replace(':personOid', action.payload.oid),
      action.payload,
    );
    yield put(resolveCustomerContactUpdate());
    yield put(
      loadOrganizerCustomerDetails({
        oid: action.payload.organizerOid,
        personOid: action.payload.oid,
      }),
    );
  } catch (error) {
    yield put(rejectCustomerContactUpdate());
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
  yield takeLatest(
    loadOrganizerCustomerDetails.type,
    loadOrganizerCustomerDetailsSaga,
  );
  yield takeLatest(loadClerkCustomerDetails.type, loadClerkCustomerDetailsSaga);
  yield takeLatest(
    updateCustomerContactDetails.type,
    updateCustomerContactDetailsSaga,
  );
  yield takeLatest(
    updateOrganizerCustomerContactDetails.type,
    updateOrganizerCustomerContactDetailsSaga,
  );
}
