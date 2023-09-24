import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { PublicPerson } from 'interfaces/publicPerson';

interface PublicUserState extends Omit<PublicPerson, 'id'> {
  status: APIResponseStatus;
  isAuthenticated: boolean;
}

const initialState: PublicUserState = {
  status: APIResponseStatus.NotStarted,
  isAuthenticated: false,
  firstName: '',
  lastName: '',
};

const publicUserSlice = createSlice({
  name: 'publicUser',
  initialState,
  reducers: {
    loadPublicUser(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectPublicUser(state) {
      state.status = APIResponseStatus.Error;
      state.isAuthenticated = initialState.isAuthenticated;
      state.firstName = initialState.firstName;
      state.lastName = initialState.lastName;
    },
    storePublicUser(state, action: PayloadAction<PublicPerson>) {
      state.status = APIResponseStatus.Success;
      state.isAuthenticated = true;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
    },
  },
});

export const publicUserReducer = publicUserSlice.reducer;
export const { loadPublicUser, rejectPublicUser, storePublicUser } =
  publicUserSlice.actions;
