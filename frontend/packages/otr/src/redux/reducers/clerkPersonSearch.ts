import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkPerson } from 'interfaces/clerkPerson';

interface ClerkPersonSearchState {
  status: APIResponseStatus;
  identityNumber: string;
  person: ClerkPerson | undefined;
}

const initialState: ClerkPersonSearchState = {
  status: APIResponseStatus.NotStarted,
  identityNumber: '',
  person: undefined,
};

const clerkPersonSearchSlice = createSlice({
  name: 'clerkPersonSearch',
  initialState,
  reducers: {
    resetClerkPersonSearchStatus(state) {
      state.status = initialState.status;
    },
    rejectClerkPersonSearch(state) {
      state.status = APIResponseStatus.Error;
      state.identityNumber = initialState.identityNumber;
      state.person = initialState.person;
    },
    searchClerkPerson(state, action: PayloadAction<string>) {
      state.status = APIResponseStatus.InProgress;
      state.identityNumber = action.payload;
    },
    storeClerkPersonSearch(
      state,
      action: PayloadAction<ClerkPerson | undefined>
    ) {
      state.status = APIResponseStatus.Success;
      state.person = action.payload;
    },
  },
});

export const clerkPersonSearchReducer = clerkPersonSearchSlice.reducer;
export const {
  resetClerkPersonSearchStatus,
  rejectClerkPersonSearch,
  searchClerkPerson,
  storeClerkPersonSearch,
} = clerkPersonSearchSlice.actions;
