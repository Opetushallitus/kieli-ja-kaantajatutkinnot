import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { PersonDetails, PersonRegistrations } from 'interfaces/userDetails';

export interface UserDetailsState {
  personDetails?: PersonDetails;
  registrations: Array<PersonRegistrations>;
  registrationToCancel?: PersonRegistrations;
  status: APIResponseStatus;
  cancelUserRegistrationStatus: APIResponseStatus;
  isCancelModalOpen: boolean;
}

const initialState: UserDetailsState = {
  registrations: [],
  status: APIResponseStatus.NotStarted,
  cancelUserRegistrationStatus: APIResponseStatus.NotStarted,
  isCancelModalOpen: false,
};

const userDetailsSlice = createSlice({
  name: 'userDetails',
  initialState,
  reducers: {
    loadPersonDetails(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectPersonDetails(state) {
      state.status = APIResponseStatus.Error;
    },
    storePersonDetails(state, action: PayloadAction<PersonDetails>) {
      state.status = APIResponseStatus.Success;
      state.personDetails = action.payload;
    },
    cancelUserRegistration(state, _action: PayloadAction<number>) {
      state.cancelUserRegistrationStatus = APIResponseStatus.InProgress;
    },
    acceptCancelUserRegistration(state) {
      state.cancelUserRegistrationStatus = APIResponseStatus.Success;
    },
    rejectCancelUserRegistration(state) {
      state.cancelUserRegistrationStatus = APIResponseStatus.Error;
    },
    setRegistrationToCancel(
      state,
      action: PayloadAction<PersonRegistrations | undefined>,
    ) {
      state.registrationToCancel = action.payload;
    },
    resetCancelRegistrationStatus(state) {
      state.cancelUserRegistrationStatus = APIResponseStatus.NotStarted;
    },
  },
});

export const userDetailsReducer = userDetailsSlice.reducer;
export const {
  loadPersonDetails,
  rejectPersonDetails,
  storePersonDetails,
  cancelUserRegistration,
  acceptCancelUserRegistration,
  rejectCancelUserRegistration,
  setRegistrationToCancel,
  resetCancelRegistrationStatus,
} = userDetailsSlice.actions;
