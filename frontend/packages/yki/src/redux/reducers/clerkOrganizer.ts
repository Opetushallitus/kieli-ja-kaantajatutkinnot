import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkOrganizer } from 'interfaces/clerkOrganizer';
import { ClerkOrganizerRegistry } from 'interfaces/clerkOrganizerRegistry';

interface ClerkOrganizerState {
  organizers: Array<ClerkOrganizer>;
  organizerRegistry: Array<ClerkOrganizerRegistry>;
  status: APIResponseStatus;
  organizerRegistryStatus?: APIResponseStatus;
  updateStatus?: APIResponseStatus;
  searchQuery: string;
  languageFilter: string;
  levelFilter: string;
}

const initialState: ClerkOrganizerState = {
  organizers: [],
  organizerRegistry: [],
  status: APIResponseStatus.NotStarted,
  organizerRegistryStatus: APIResponseStatus.NotStarted,
  searchQuery: '',
  languageFilter: '',
  levelFilter: '',
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
    storeClerkOrganizerRegistry(
      state,
      action: PayloadAction<Array<ClerkOrganizerRegistry>>,
    ) {
      state.organizerRegistryStatus = APIResponseStatus.Success;
      state.organizerRegistry = action.payload;
    },
    updateClerkOrganizer(state, _action: PayloadAction<ClerkOrganizer>) {
      state.updateStatus = APIResponseStatus.InProgress;
    },
    updateClerkOrganizerSuccess(state, action: PayloadAction<ClerkOrganizer>) {
      state.updateStatus = APIResponseStatus.Success;
      const index = state.organizers.findIndex(
        (o) => o.id === action.payload.id,
      );
      if (index !== -1) {
        state.organizers[index] = action.payload;
      }

      const registryIndex = state.organizerRegistry.findIndex(
        (r) => r.organizer.id === action.payload.id,
      );
      if (registryIndex !== -1) {
        state.organizerRegistry[registryIndex] = {
          ...state.organizerRegistry[registryIndex],
          organizer: action.payload,
        };
      }
    },
    updateClerkOrganizerError(state) {
      state.updateStatus = APIResponseStatus.Error;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setLanguageFilter(state, action: PayloadAction<string>) {
      state.languageFilter = action.payload;
    },
    setLevelFilter(state, action: PayloadAction<string>) {
      state.levelFilter = action.payload;
    },
  },
});

export const clerkOrganizersReducer = clerkOrganizersSlice.reducer;
export const {
  loadClerkOrganizers,
  rejectClerkOrganizers,
  storeClerkOrganizers,
  loadClerkOrganizerRegistry,
  storeClerkOrganizerRegistry,
  updateClerkOrganizer,
  updateClerkOrganizerSuccess,
  updateClerkOrganizerError,
  setSearchQuery,
  setLanguageFilter,
  setLevelFilter,
} = clerkOrganizersSlice.actions;
