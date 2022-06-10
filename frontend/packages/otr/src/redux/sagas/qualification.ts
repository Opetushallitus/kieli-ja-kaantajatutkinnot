import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { Qualification } from 'interfaces/qualification';
import { loadClerkInterpreterOverview } from 'redux/reducers/clerkInterpreterOverview';
import {
  addQualification,
  addQualificationSuccess,
  rejectAddQualification,
} from 'redux/reducers/qualification';
import { SerializationUtils } from 'utils/serialization';

function* onAddQualification(action: PayloadAction<Qualification>) {
  try {
    const { interpreterId } = action.payload;
    if (!interpreterId) {
      throw new Error();
    }
    yield call(
      axiosInstance.post,
      `${APIEndpoints.ClerkInterpreter}/${interpreterId}/qualification`,
      SerializationUtils.serializeQualification(action.payload)
    );

    yield put(addQualificationSuccess());
    yield put(loadClerkInterpreterOverview({ id: interpreterId }));
  } catch (error) {
    yield put(rejectAddQualification());
  }
}

export function* watchAddQualification() {
  yield takeLatest(addQualification, onAddQualification);
}
