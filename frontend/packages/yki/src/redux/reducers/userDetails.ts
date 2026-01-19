import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ModifyContactDetails,
  PersonDetails,
  PersonRegistrations,
} from 'interfaces/userDetails';

export interface UserDetailsState {
  personDetails?: PersonDetails;
  registrations: Array<PersonRegistrations>;
  registrationToCancel?: PersonRegistrations;
  status: APIResponseStatus;
  cancelUserRegistrationStatus: APIResponseStatus;
  isCancelModalOpen: boolean;
  modifyContactDetails: Partial<ModifyContactDetails>;
  modifyContactDetailsStatus: APIResponseStatus;
}

const initialState: UserDetailsState = {
  registrations: [],
  status: APIResponseStatus.NotStarted,
  cancelUserRegistrationStatus: APIResponseStatus.NotStarted,
  isCancelModalOpen: false,
  modifyContactDetailsStatus: APIResponseStatus.NotStarted,
  modifyContactDetails: {},
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
    storePersonDetails(
      state,
      action: PayloadAction<PersonDetails | undefined>,
    ) {
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
    doModifyContactDetails(
      state,
      _action: PayloadAction<ModifyContactDetails>,
    ) {
      state.modifyContactDetailsStatus = APIResponseStatus.InProgress;
    },
    updateModifyContactDetails(
      state,
      action: PayloadAction<Partial<ModifyContactDetails>>,
    ) {
      state.modifyContactDetails = {
        ...state.modifyContactDetails,
        ...action.payload,
      };
    },
    rejectModifyContactDetails(state) {
      state.modifyContactDetailsStatus = APIResponseStatus.Error;
    },
    acceptModifyContactDetails(state) {
      state.modifyContactDetailsStatus = APIResponseStatus.Success;
    },
    resetModifyContactDetails(state) {
      state.modifyContactDetails = initialState.modifyContactDetails;
      state.modifyContactDetailsStatus =
        initialState.modifyContactDetailsStatus;
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
  updateModifyContactDetails,
  resetModifyContactDetails,
  doModifyContactDetails,
  acceptModifyContactDetails,
  rejectModifyContactDetails,
} = userDetailsSlice.actions;
