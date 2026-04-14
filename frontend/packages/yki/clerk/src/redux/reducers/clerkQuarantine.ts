import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkQuarantineMatch,
  ClerkQuarantineSort,
} from 'interfaces/clerkQuarantine';

interface ClerkQuarantineState {
  matches: ClerkQuarantineMatch[];
  sort: ClerkQuarantineSort;
  status: APIResponseStatus;
}

const initialState: ClerkQuarantineState = {
  matches: [],
  sort: 'examDate:asc',
  status: APIResponseStatus.NotStarted,
};

const clerkQuarantineSlice = createSlice({
  name: 'clerkQuarantine',
  initialState,
  reducers: {
    loadClerkQuarantineMatches(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectClerkQuarantineMatches(state) {
      state.status = APIResponseStatus.Error;
    },
    storeClerkQuarantineMatches(
      state,
      action: PayloadAction<ClerkQuarantineMatch[]>,
    ) {
      state.status = APIResponseStatus.Success;
      state.matches = action.payload;
    },
    setQuarantineSort(state, action: PayloadAction<ClerkQuarantineSort>) {
      state.sort = action.payload;
    },
  },
});

export const clerkQuarantineReducer = clerkQuarantineSlice.reducer;
export const {
  loadClerkQuarantineMatches,
  rejectClerkQuarantineMatches,
  setQuarantineSort,
  storeClerkQuarantineMatches,
} = clerkQuarantineSlice.actions;
