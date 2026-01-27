import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { LoginLinkRenewRequest } from 'interfaces/loginLink';

export interface LoginLinkRenewState {
  status: APIResponseStatus;
}

const initialState: LoginLinkRenewState = {
  status: APIResponseStatus.NotStarted,
};

const loginLinkRenewSlice = createSlice({
  name: 'loginLinkRenew',
  initialState,
  reducers: {
    acceptLoginLinkRenew(state) {
      state.status = APIResponseStatus.Success;
    },
    loadLoginLinkRenew(state, _: PayloadAction<LoginLinkRenewRequest>) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectLoginLinkRenew(state) {
      state.status = APIResponseStatus.Error;
    },
    resetLoginLinkRenew(_) {
      return initialState;
    },
  },
});

export const loginLinkRenewReducer = loginLinkRenewSlice.reducer;
export const {
  acceptLoginLinkRenew,
  loadLoginLinkRenew,
  rejectLoginLinkRenew,
  resetLoginLinkRenew,
} = loginLinkRenewSlice.actions;
