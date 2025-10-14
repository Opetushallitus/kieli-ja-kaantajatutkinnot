import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkOrganizer } from 'interfaces/clerkOrganizer';

interface ClerkOrganizerState {
  organizers: Array<ClerkOrganizer>;
  status: APIResponseStatus;
}

const initialState: ClerkOrganizerState = {
  organizers: [],
  status: APIResponseStatus.NotStarted,
};

const clerkOrganizersSlice = createSlice({
  name: 'clerkOrganizer',
  initialState,
  reducers: {
    loadClerkOrganizers(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectClerkOrganizers(state) {
      state.status = APIResponseStatus.Error;
    },
    storeClerkOrganizers(state, action: PayloadAction<Array<ClerkOrganizer>>) {
      state.status = APIResponseStatus.Success;
      state.organizers = action.payload;
    },
  },
});

export const clerkOrganizersReducer = clerkOrganizersSlice.reducer;
export const {
  loadClerkOrganizers,
  rejectClerkOrganizers,
  storeClerkOrganizers,
} = clerkOrganizersSlice.actions;
