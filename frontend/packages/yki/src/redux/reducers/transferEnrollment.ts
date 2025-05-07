import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { TransferEnrollmentDetails } from 'interfaces/transferEnrollment';

export interface TransferEnrollmentState {
  transferEnrollmentDetails?: TransferEnrollmentDetails;
  status: APIResponseStatus;
}

const initialState: TransferEnrollmentState = {
  status: APIResponseStatus.NotStarted,
};

const transferEnrollmentSlice = createSlice({
  name: 'transferEnrollment',
  initialState,
  reducers: {
    loadTransferEnrollmentDetails(state, _action: PayloadAction<number>) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectTransferEnrollmentDetails(state) {
      state.status = APIResponseStatus.Error;
    },
    acceptTransferEnrollmentDetails(
      state,
      action: PayloadAction<TransferEnrollmentDetails>,
    ) {
      state.status = APIResponseStatus.Success;
      state.transferEnrollmentDetails = action.payload;
    },
  },
});

export const transferEnrollmentReducer = transferEnrollmentSlice.reducer;
export const {
  loadTransferEnrollmentDetails,
  rejectTransferEnrollmentDetails,
  acceptTransferEnrollmentDetails,
} = transferEnrollmentSlice.actions;
