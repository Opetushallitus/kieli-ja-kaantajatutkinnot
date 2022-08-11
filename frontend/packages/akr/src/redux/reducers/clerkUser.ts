import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkUser, ClerkUserState } from 'interfaces/clerkUser';

const initialState: ClerkUserState = {
  status: APIResponseStatus.NotStarted,
  isAuthenticated: false,
  oid: '',
};

const clerkUserSlice = createSlice({
  name: 'clerkUser',
  initialState,
  reducers: {
    loadClerkUser(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectClerkUser(state) {
      state.status = APIResponseStatus.Error;
      state.isAuthenticated = false;
    },
    storeClerkUser(state, action: PayloadAction<ClerkUser>) {
      state.status = APIResponseStatus.Success;
      state.isAuthenticated = true;
      state.oid = action.payload.oid;
    },
  },
});

export const clerkUserReducer = clerkUserSlice.reducer;
export const { loadClerkUser, rejectClerkUser, storeClerkUser } =
  clerkUserSlice.actions;
