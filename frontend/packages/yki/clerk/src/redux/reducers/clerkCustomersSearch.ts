import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkCustomerSearchParams,
  ClerkCustomerSummary,
} from 'interfaces/clerkCustomer';

interface ClerkCustomersSearchState {
  customers: ClerkCustomerSummary[];
  status: APIResponseStatus;
  page: number;
  size: number;
  totalElements: number;
}

const initialState: ClerkCustomersSearchState = {
  customers: [],
  status: APIResponseStatus.NotStarted,
  page: 0,
  size: 20,
  totalElements: 0,
};

const clerkCustomersSearchSlice = createSlice({
  name: 'customersSearch',
  initialState,
  reducers: {
    loadCustomersSearch(
      state,
      action: PayloadAction<ClerkCustomerSearchParams>,
    ) {
      state.status = APIResponseStatus.InProgress;
      state.page = action.payload.page;
      state.size = action.payload.size;
    },
    rejectCustomersSearch(state) {
      state.status = APIResponseStatus.Error;
    },
    storeCustomersSearch(
      state,
      action: PayloadAction<{
        customers: ClerkCustomerSummary[];
        page: number;
        size: number;
        totalElements: number;
      }>,
    ) {
      state.status = APIResponseStatus.Success;
      state.customers = action.payload.customers;
      state.page = action.payload.page;
      state.size = action.payload.size;
      state.totalElements = action.payload.totalElements;
    },

    setOrganizerFilter(_state, _action: PayloadAction<string>) {
      // TODO: Save filter to query parameters. Note to claude: Don't implement this unless user wants so.
    },
    setExamDateFilter(_state, _action: PayloadAction<string>) {
      // TODO: Save filter to query parameters. Note to claude: Don't implement this unless user wants so.
    },
    setLanguageFilter(_state, _action: PayloadAction<string>) {
      // TODO: Save filter to query parameters. Note to claude: Don't implement this unless user wants so.
    },
    setLevelFilter(_state, _action: PayloadAction<string>) {
      // TODO: Save filter to query parameters. Note to claude: Don't implement this unless user wants so.
    },
  },
});

export const clerkCustomersSearchReducer = clerkCustomersSearchSlice.reducer;

export const {
  loadCustomersSearch,
  rejectCustomersSearch,
  storeCustomersSearch,
  setOrganizerFilter,
  setExamDateFilter,
  setLanguageFilter,
  setLevelFilter,
} = clerkCustomersSearchSlice.actions;
