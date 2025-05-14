import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  RelocateRequest,
  TransferEnrollmentDetails,
} from 'interfaces/transferEnrollment';

export interface TransferEnrollmentState {
  transferEnrollmentDetails?: TransferEnrollmentDetails;
  loadDetailsStatus: APIResponseStatus;
  transferStatus: APIResponseStatus;
}

const initialState: TransferEnrollmentState = {
  loadDetailsStatus: APIResponseStatus.NotStarted,
  transferStatus: APIResponseStatus.NotStarted,
};

const transferEnrollmentSlice = createSlice({
  name: 'transferEnrollment',
  initialState,
  reducers: {
    loadTransferEnrollmentDetails(state, _action: PayloadAction<number>) {
      state.loadDetailsStatus = APIResponseStatus.InProgress;
    },
    rejectTransferEnrollmentDetails(state) {
      state.loadDetailsStatus = APIResponseStatus.Error;
    },
    acceptTransferEnrollmentDetails(
      state,
      action: PayloadAction<TransferEnrollmentDetails>,
    ) {
      state.loadDetailsStatus = APIResponseStatus.Success;
      state.transferEnrollmentDetails = action.payload;
    },
    transferEnrollment(state, _action: PayloadAction<RelocateRequest>) {
      state.transferStatus = APIResponseStatus.InProgress;
    },
    rejectTransferEnrollment(state) {
      state.transferStatus = APIResponseStatus.Error;
    },
    acceptTransferEnrollment(state) {
      state.transferStatus = APIResponseStatus.Success;
    },
    resetTransferEnrollmentState(_state) {
      return initialState;
    },
  },
});

export const transferEnrollmentReducer = transferEnrollmentSlice.reducer;
export const {
  loadTransferEnrollmentDetails,
  rejectTransferEnrollmentDetails,
  acceptTransferEnrollmentDetails,
  transferEnrollment,
  rejectTransferEnrollment,
  acceptTransferEnrollment,
  resetTransferEnrollmentState,
} = transferEnrollmentSlice.actions;
