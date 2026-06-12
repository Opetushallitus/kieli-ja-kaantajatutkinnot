import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkOrganization,
  ClerkOrganizer,
  ClerkOrganizerHierarchy,
} from 'interfaces/clerkOrganizer';
import {
  ClerkOrganizerRegistry,
  FindByOidsOrganization,
} from 'interfaces/clerkOrganizerRegistry';

interface ClerkOrganizerState {
  organizers: Array<ClerkOrganizer>;
  organization?: FindByOidsOrganization;
  organizerRegistry: Array<ClerkOrganizerRegistry>;
  allOrganizations: Array<ClerkOrganization>;
  organizationHierarchy: Array<ClerkOrganizerHierarchy>;
  status: APIResponseStatus;
  organizationStatus: APIResponseStatus;
  organizerRegistryStatus: APIResponseStatus;
  organizationHierarchyStatus: APIResponseStatus;
  addClerkOrganizerStatus: APIResponseStatus;
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
  organizationHierarchy: [],
  status: APIResponseStatus.NotStarted,
  organizationStatus: APIResponseStatus.NotStarted,
  organizerRegistryStatus: APIResponseStatus.NotStarted,
  organizationHierarchyStatus: APIResponseStatus.NotStarted,
  addClerkOrganizerStatus: APIResponseStatus.NotStarted,
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
    rejectLoadClerkOrganizerRegistry(state) {
      state.organizerRegistryStatus = APIResponseStatus.Error;
    },
    storeClerkOrganizerRegistry(
      state,
      action: PayloadAction<Array<ClerkOrganizerRegistry>>,
    ) {
      state.organizerRegistryStatus = APIResponseStatus.Success;
      state.organizerRegistry = action.payload;
    },
    updateClerkOrganizer(
      state,
      _action: PayloadAction<Partial<ClerkOrganizer>>,
    ) {
      state.updateStatus = APIResponseStatus.InProgress;
    },
    updateClerkOrganizerSuccess(state, action: PayloadAction<ClerkOrganizer>) {
      state.updateStatus = APIResponseStatus.Success;
      const index = state.organizers.findIndex(
        (o) => o.oid === action.payload.oid,
      );
      if (index !== -1) {
        state.organizers[index] = action.payload;
      }

      const registryIndex = state.organizerRegistry.findIndex(
        (r) => r.organizer.oid === action.payload.oid,
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
    resetUpdateClerkOrganizerStatus(state) {
      state.updateStatus = APIResponseStatus.NotStarted;
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
    storeAllOrganizations(
      state,
      action: PayloadAction<Array<ClerkOrganization>>,
    ) {
      state.allOrganizationsStatus = APIResponseStatus.Success;
      state.allOrganizations = action.payload;
    },
    rejectAllOrganizations(state) {
      state.allOrganizationsStatus = APIResponseStatus.Error;
    },
    loadClerkOrganization(state, _action: PayloadAction<Array<string>>) {
      state.organizationStatus = APIResponseStatus.InProgress;
    },
    storeClerkOrganization(
      state,
      action: PayloadAction<FindByOidsOrganization>,
    ) {
      state.organizationStatus = APIResponseStatus.Success;
      state.organization = action.payload;
    },
    rejectClerkOrganization(state) {
      state.organizationStatus = APIResponseStatus.Error;
    },
    resetClerkOrganization(state) {
      state.organizationStatus = APIResponseStatus.NotStarted;
      state.organization = undefined;
    },
    loadOrganizationHierarchy(state, _action: PayloadAction<string>) {
      state.organizationHierarchyStatus = APIResponseStatus.InProgress;
    },
    storeOrganizationHierarchy(
      state,
      action: PayloadAction<Array<ClerkOrganizerHierarchy>>,
    ) {
      state.organizationHierarchyStatus = APIResponseStatus.Success;
      state.organizationHierarchy = action.payload;
    },
    rejectOrganizationHierarchy(state) {
      state.organizationHierarchyStatus = APIResponseStatus.Error;
    },
    addClerkOrganizer(
      state,
      _action: PayloadAction<Omit<ClerkOrganizer, 'id' | 'nimi'>>,
    ) {
      state.addClerkOrganizerStatus = APIResponseStatus.InProgress;
    },
    storeAddClerkOrganizer(
      state,
      action: PayloadAction<ClerkOrganizerRegistry>,
    ) {
      state.addClerkOrganizerStatus = APIResponseStatus.Success;
      state.organizers.push(action.payload.organizer);
      state.organizerRegistry.push(action.payload);
    },
    rejectAddClerkOrganizer(state) {
      state.addClerkOrganizerStatus = APIResponseStatus.Error;
    },
  },
});

export const clerkOrganizersReducer = clerkOrganizersSlice.reducer;
export const {
  loadClerkOrganizers,
  rejectClerkOrganizers,
  storeClerkOrganizers,
  loadClerkOrganizerRegistry,
  rejectLoadClerkOrganizerRegistry,
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
  loadClerkOrganization,
  storeClerkOrganization,
  rejectClerkOrganization,
  resetClerkOrganization,
  loadOrganizationHierarchy,
  storeOrganizationHierarchy,
  rejectOrganizationHierarchy,
  addClerkOrganizer,
  storeAddClerkOrganizer,
  rejectAddClerkOrganizer,
  resetUpdateClerkOrganizerStatus,
} = clerkOrganizersSlice.actions;
