import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkCustomerSearchParams,
  ClerkCustomerSummary,
  ClerkCustomerSummaryResponse,
  PageResponse,
} from 'interfaces/clerkCustomer';
import {
  loadCustomersSearch,
  rejectCustomersSearch,
  storeCustomersSearch,
} from 'redux/reducers/clerkCustomersSearch';
import { SerializationUtils } from 'utils/serialization';

function* loadCustomersSearchSaga(
  action: PayloadAction<ClerkCustomerSearchParams>,
) {
  try {
    const { page, size, request } = action.payload;
    const response: AxiosResponse<PageResponse<ClerkCustomerSummaryResponse>> =
      yield call(
        axiosInstance.post,
        APIEndpoints.ClerkCustomersSearch.replace(':page', `${page}`).replace(
          ':size',
          `${size}`,
        ),
        request,
      );
    const customers: ClerkCustomerSummary[] = response.data.content.map(
      SerializationUtils.deserializeClerkCustomerSummaryResponse,
    );
    yield put(
      storeCustomersSearch({
        customers,
        page: response.data.number,
        size: response.data.size,
        totalElements: response.data.totalElements,
      }),
    );
  } catch (error) {
    yield put(rejectCustomersSearch());
  }
}

export function* watchClerkCustomersSearch() {
  yield takeLatest(loadCustomersSearch.type, loadCustomersSearchSaga);
}
