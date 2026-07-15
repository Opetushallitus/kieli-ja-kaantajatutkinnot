import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { Me, User } from 'interfaces/session';

export interface UserState {
  status: APIResponseStatus;
  meStatus: APIResponseStatus;
  user?: User;
  me?: Me;
}

const initialState: UserState = {
  status: APIResponseStatus.NotStarted,
  meStatus: APIResponseStatus.NotStarted,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    acceptUser(state, action: PayloadAction<User>) {
      state.status = APIResponseStatus.Success;
      state.user = action.payload;
    },
    loadUser(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectUser(state) {
      state.status = APIResponseStatus.Error;
    },
    loadMe(state) {
      state.meStatus = APIResponseStatus.InProgress;
    },
    acceptMe(state, action: PayloadAction<Me>) {
      state.meStatus = APIResponseStatus.Success;
      state.me = action.payload;
    },
    rejectMe(state) {
      state.meStatus = APIResponseStatus.Error;
    },
  },
});

export const userReducer = userSlice.reducer;
export const { acceptUser, loadUser, loadMe, rejectUser, acceptMe, rejectMe } =
  userSlice.actions;
