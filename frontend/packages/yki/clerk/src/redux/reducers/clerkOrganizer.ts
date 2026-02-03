import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkOrganizer } from 'interfaces/clerkOrganizer';
import { ClerkOrganizerRegistry } from 'interfaces/clerkOrganizerRegistry';

interface Organization {
  oid: string;
  nimi: {
    fi: string;
    sv?: string;
    en?: string;
  };
  kotipaikkaUri?: string;
  status: string;
}

interface ClerkOrganizerState {
  organizers: Array<ClerkOrganizer>;
  organizerRegistry: Array<ClerkOrganizerRegistry>;
  allOrganizations: Array<Organization>;
  status: APIResponseStatus;
  organizerRegistryStatus?: APIResponseStatus;
  updateStatus?: APIResponseStatus;
  allOrganizationsStatus?: APIResponseStatus;
  searchQuery: string;
  languageFilter: string;
  levelFilter: string;
}

const initialState: ClerkOrganizerState = {
  organizers: [],
  organizerRegistry: [],
  allOrganizations: [],
  status: APIResponseStatus.NotStarted,
  organizerRegistryStatus: APIResponseStatus.NotStarted,
  updateStatus: APIResponseStatus.NotStarted,
  allOrganizationsStatus: APIResponseStatus.NotStarted,
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
    loadAllOrganizations(state) {
      state.allOrganizationsStatus = APIResponseStatus.InProgress;
    },
    storeAllOrganizations(state, action: PayloadAction<Array<Organization>>) {
      state.allOrganizationsStatus = APIResponseStatus.Success;
      state.allOrganizations = action.payload;
    },
    rejectAllOrganizations(state) {
      state.allOrganizationsStatus = APIResponseStatus.Error;
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
  loadAllOrganizations,
  storeAllOrganizations,
  rejectAllOrganizations,
} = clerkOrganizersSlice.actions;
