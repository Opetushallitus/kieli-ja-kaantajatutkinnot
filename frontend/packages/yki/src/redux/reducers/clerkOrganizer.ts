import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkOrganizer } from 'interfaces/clerkOrganizer';
import { ClerkOrganizerRegistry } from 'interfaces/clerkOrganizerRegistry';

interface ClerkOrganizerState {
  organizers: Array<ClerkOrganizer>;
  organizerRegistry: Array<ClerkOrganizerRegistry>;
  status: APIResponseStatus;
  organizerRegistryStatus?: APIResponseStatus;
}

const initialState: ClerkOrganizerState = {
  organizers: [],
  organizerRegistry: [],
  status: APIResponseStatus.NotStarted,
  organizerRegistryStatus: APIResponseStatus.NotStarted,
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
    loadClerkOrganizerRegistry(state) {
      state.organizerRegistryStatus = APIResponseStatus.InProgress;
    },
    rejectClerkOrganizerRegistry(state) {
      state.organizerRegistryStatus = APIResponseStatus.Error;
    },
    storeClerkOrganizerRegistry(
      state,
      action: PayloadAction<Array<ClerkOrganizerRegistry>>,
    ) {
      state.organizerRegistryStatus = APIResponseStatus.Success;
      state.organizerRegistry = action.payload;
    },
  },
});

export const clerkOrganizersReducer = clerkOrganizersSlice.reducer;
export const {
  loadClerkOrganizers,
  rejectClerkOrganizers,
  storeClerkOrganizers,
  loadClerkOrganizerRegistry,
  rejectClerkOrganizerRegistry,
  storeClerkOrganizerRegistry,
} = clerkOrganizersSlice.actions;
