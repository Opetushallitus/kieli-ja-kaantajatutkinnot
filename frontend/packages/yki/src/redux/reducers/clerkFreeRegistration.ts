import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkFreeRegistration } from 'interfaces/clerkFreeRegistration';

interface ClerkFreeRegistrationState {
  freeRegistrations: Array<ClerkFreeRegistration>;
  status: APIResponseStatus;
  registrationStatus: APIResponseStatus;
}

const initialState: ClerkFreeRegistrationState = {
  freeRegistrations: [],
  status: APIResponseStatus.NotStarted,
  registrationStatus: APIResponseStatus.NotStarted,
};

const clerkFreeRegistrationSlice = createSlice({
  name: 'clerkFreeRegistration',
  initialState,
  reducers: {
    loadClerkFreeRegistrations(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectClerkFreeRegistrations(state) {
      state.status = APIResponseStatus.Error;
    },
    storeClerkFreeRegistrations(
      state,
      action: PayloadAction<Array<ClerkFreeRegistration>>,
    ) {
      state.status = APIResponseStatus.Success;
      state.freeRegistrations = action.payload;
    },
    approveFreeRegistration(state) {
      state.registrationStatus = APIResponseStatus.InProgress;
    },
    acceptFreeRegistrationApproval(state) {
      state.registrationStatus = APIResponseStatus.Success;
    },
    rejectFreeRegistrationApproval(state) {
      state.registrationStatus = APIResponseStatus.Error;
    },
  },
});

export const clerkFreeRegistrationReducer = clerkFreeRegistrationSlice.reducer;
export const {
  loadClerkFreeRegistrations,
  rejectClerkFreeRegistrations,
  storeClerkFreeRegistrations,
  approveFreeRegistration,
  acceptFreeRegistrationApproval,
  rejectFreeRegistrationApproval,
} = clerkFreeRegistrationSlice.actions;
