import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

interface AuthState {
  status: APIResponseStatus;
}

const initialState: AuthState = {
  status: APIResponseStatus.NotStarted,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    startAuthentication(state, _action: PayloadAction<string>) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectAuthentication(state) {
      state.status = APIResponseStatus.Error;
    },
    authenticationSucceeded(state) {
      state.status = APIResponseStatus.Success;
    },
    resetAuthentication(state) {
      state.status = initialState.status;
    },
  },
});

export const authReducer = authSlice.reducer;
export const {
  startAuthentication,
  rejectAuthentication,
  authenticationSucceeded,
  resetAuthentication,
} = authSlice.actions;
