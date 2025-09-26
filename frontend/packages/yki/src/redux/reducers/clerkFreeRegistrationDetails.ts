import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkFreeRegistrationDetails } from 'interfaces/clerkFreeRegistration';

interface ClerkFreeRegistrationState {
  registrationDetails: ClerkFreeRegistrationDetails | null;
  status: APIResponseStatus;
}

const initialState: ClerkFreeRegistrationState = {
  registrationDetails: null,
  status: APIResponseStatus.NotStarted,
};

const clerkFreeRegistrationDetailsSlice = createSlice({
  name: 'clerkFreeRegistrationDetails',
  initialState,
  reducers: {
    loadClerkFreeRegistrationDetails(state, _action: PayloadAction<number>) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectClerkFreeRegistrationDetails(state) {
      state.status = APIResponseStatus.Error;
    },
    storeClerkFreeRegistrationDetails(
      state,
      action: PayloadAction<ClerkFreeRegistrationDetails>,
    ) {
      state.status = APIResponseStatus.Success;
      state.registrationDetails = action.payload;
    },
    resetClerkFreeRegistrationDetails(state) {
      state.status = APIResponseStatus.NotStarted;
      state.registrationDetails = null;
    },
  },
});

export const clerkFreeRegistrationDetailsReducer =
  clerkFreeRegistrationDetailsSlice.reducer;
export const {
  loadClerkFreeRegistrationDetails,
  rejectClerkFreeRegistrationDetails,
  storeClerkFreeRegistrationDetails,
  resetClerkFreeRegistrationDetails,
} = clerkFreeRegistrationDetailsSlice.actions;
