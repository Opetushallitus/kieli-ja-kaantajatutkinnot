import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkOrganizer,
  ClerkOrganizerFilters,
} from 'interfaces/clerkOrganizer';

interface ClerkOrganizerState {
  organizers: Array<ClerkOrganizer>;
  status: APIResponseStatus;
  filters: ClerkOrganizerFilters;
}

const initialState: ClerkOrganizerState = {
  organizers: [],
  status: APIResponseStatus.NotStarted,
  filters: {},
};

const clerkOrganizersSlice = createSlice({
  name: 'clerkOrganizer',
  initialState,
  reducers: {
    addClerkOrganizerFilter(
      state,
      action: PayloadAction<Partial<ClerkOrganizerFilters>>,
    ) {
      state.filters = { ...state.filters, ...action.payload };
    },
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
  addClerkOrganizerFilter,
  loadClerkOrganizers,
  rejectClerkOrganizers,
  storeClerkOrganizers,
} = clerkOrganizersSlice.actions;
