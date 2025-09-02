import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { RegistrationToConfirmDetails } from 'interfaces/confirmRegistration';

export interface ConfirmRegistrationState {
  registrationDetails?: RegistrationToConfirmDetails;
  loadDetailsStatus: APIResponseStatus;
  confirmRegistrationStatus: APIResponseStatus;
}

const initialState: ConfirmRegistrationState = {
  loadDetailsStatus: APIResponseStatus.NotStarted,
  confirmRegistrationStatus: APIResponseStatus.NotStarted,
};

const confirmRegistrationSlice = createSlice({
  name: 'confirmRegistration',
  initialState,
  reducers: {
    loadRegistrationToConfirmDetails(state, _action: PayloadAction<number>) {
      state.loadDetailsStatus = APIResponseStatus.InProgress;
    },
    acceptRegistrationToConfirmDetails(
      state,
      action: PayloadAction<RegistrationToConfirmDetails>,
    ) {
      state.registrationDetails = action.payload;
      state.loadDetailsStatus = APIResponseStatus.Success;
    },
    rejectRegistrationToConfirmDetails(state) {
      state.loadDetailsStatus = APIResponseStatus.Error;
    },
  },
});

export const confirmRegistrationReducer = confirmRegistrationSlice.reducer;
export const {
  acceptRegistrationToConfirmDetails,
  loadRegistrationToConfirmDetails,
  rejectRegistrationToConfirmDetails,
} = confirmRegistrationSlice.actions;
