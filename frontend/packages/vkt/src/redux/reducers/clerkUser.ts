import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkUser, ClerkUserState } from 'interfaces/clerkUser';

const initialState: ClerkUserState = {
  status: APIResponseStatus.NotStarted,
  isAuthenticated: false,
  isAdmin: false,
  isExaminer: false,
  oid: '',
};

const clerkUserSlice = createSlice({
  name: 'clerkUser',
  initialState,
  reducers: {
    loadClerkUser(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectClerkUser(_) {
      return { ...initialState, status: APIResponseStatus.Error };
    },
    storeClerkUser(_, action: PayloadAction<ClerkUser>) {
      return {
        ...action.payload,
        status: APIResponseStatus.Success,
        isAuthenticated: true,
      };
    },
  },
});

export const clerkUserReducer = clerkUserSlice.reducer;
export const { loadClerkUser, rejectClerkUser, storeClerkUser } =
  clerkUserSlice.actions;
