import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';

import { LoginLinkDetails } from 'interfaces/loginLink';

export interface LoginLinkState {
  code?: string;
  expires_at?: Dayjs;
  status: APIResponseStatus;
}

const initialState: LoginLinkState = {
  status: APIResponseStatus.NotStarted,
};

const loginLinkSlice = createSlice({
  name: 'loginLink',
  initialState,
  reducers: {
    acceptLoginLink(state, action: PayloadAction<LoginLinkDetails>) {
      state.status = APIResponseStatus.Success;
      state.expires_at = action.payload.expires_at;
    },
    loadLoginLink(state, action: PayloadAction<string>) {
      state.code = action.payload;
      state.status = APIResponseStatus.InProgress;
    },
    rejectLoginLink(state) {
      state.status = APIResponseStatus.Error;
    },
    resetLoginLink(_) {
      return initialState;
    },
  },
});

export const loginLinkReducer = loginLinkSlice.reducer;
export const {
  acceptLoginLink,
  loadLoginLink,
  rejectLoginLink,
  resetLoginLink,
} = loginLinkSlice.actions;
