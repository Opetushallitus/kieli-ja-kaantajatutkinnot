import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { User } from 'interfaces/session';

export interface UserState {
  status: APIResponseStatus;
  user?: User;
}

const initialState: UserState = {
  status: APIResponseStatus.NotStarted,
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
  },
});

export const userReducer = userSlice.reducer;
export const { acceptUser, loadUser, rejectUser } = userSlice.actions;
