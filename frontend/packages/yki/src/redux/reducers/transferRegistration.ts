import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  RelocateRequest,
  TransferRegistrationDetails,
} from 'interfaces/transferRegistration';

export interface TransferRegistrationState {
  transferRegistrationDetails?: TransferRegistrationDetails;
  loadDetailsStatus: APIResponseStatus;
  transferStatus: APIResponseStatus;
}

const initialState: TransferRegistrationState = {
  loadDetailsStatus: APIResponseStatus.NotStarted,
  transferStatus: APIResponseStatus.NotStarted,
};

const transferRegistrationSlice = createSlice({
  name: 'transferRegistration',
  initialState,
  reducers: {
    loadTransferRegistrationDetails(state, _action: PayloadAction<number>) {
      state.loadDetailsStatus = APIResponseStatus.InProgress;
    },
    rejectTransferRegistrationDetails(state) {
      state.loadDetailsStatus = APIResponseStatus.Error;
    },
    acceptTransferRegistrationDetails(
      state,
      action: PayloadAction<TransferRegistrationDetails>,
    ) {
      state.loadDetailsStatus = APIResponseStatus.Success;
      state.transferRegistrationDetails = action.payload;
    },
    transferRegistration(state, _action: PayloadAction<RelocateRequest>) {
      state.transferStatus = APIResponseStatus.InProgress;
    },
    rejectTransferRegistration(state) {
      state.transferStatus = APIResponseStatus.Error;
    },
    acceptTransferRegistration(state) {
      state.transferStatus = APIResponseStatus.Success;
    },
    resetTransferRegistrationState(_state) {
      return initialState;
    },
  },
});

export const transferRegistrationReducer = transferRegistrationSlice.reducer;
export const {
  loadTransferRegistrationDetails,
  rejectTransferRegistrationDetails,
  acceptTransferRegistrationDetails,
  transferRegistration,
  rejectTransferRegistration,
  acceptTransferRegistration,
  resetTransferRegistrationState,
} = transferRegistrationSlice.actions;
