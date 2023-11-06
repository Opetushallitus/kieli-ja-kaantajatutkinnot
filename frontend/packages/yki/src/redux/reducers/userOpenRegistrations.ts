import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  UserOpenRegistration,
  UserOpenRegistrationsResponse,
} from 'interfaces/publicRegistration';

interface UserOpenRegistrationsState {
  status: APIResponseStatus;
  openRegistrations?: Array<UserOpenRegistration>;
}

const initialState: UserOpenRegistrationsState = {
  status: APIResponseStatus.NotStarted,
};

const userOpenRegistrationsSlice = createSlice({
  name: 'userOpenRegistrations',
  initialState,
  reducers: {
    acceptUserOpenRegistrations(
      state,
      action: PayloadAction<UserOpenRegistrationsResponse>
    ) {
      state.status = APIResponseStatus.Success;
      state.openRegistrations = action.payload.open_registrations;
    },
    loadUserOpenRegistrations(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectUserOpenRegistrations(state) {
      state.status = APIResponseStatus.Error;
    },
    resetUserOpenRegistrations(state) {
      state.status = APIResponseStatus.NotStarted;
    },
  },
});

export const userOpenRegistrationsReducer = userOpenRegistrationsSlice.reducer;
export const {
  acceptUserOpenRegistrations,
  loadUserOpenRegistrations,
  rejectUserOpenRegistrations,
  resetUserOpenRegistrations,
} = userOpenRegistrationsSlice.actions;
