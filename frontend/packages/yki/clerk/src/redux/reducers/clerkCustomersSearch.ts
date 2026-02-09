import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkCustomerSearchParams,
  ClerkCustomerSummary,
} from 'interfaces/clerkCustomer';

interface ClerkCustomersSearchState {
  customers: ClerkCustomerSummary[];
  status: APIResponseStatus;

  // filter
  searchQueryFilter?: string;
  organizerIdFilter?: number;
  examDateIdFilter?: number;
  languageCodeFilter?: string;
  levelCodeFilter?: 'PERUS' | 'KESKI' | 'YLIN';

  // pagination
  page: number;
  size: number;
  totalElements: number;

  // sort
  sort: string;
}

const initialState: ClerkCustomersSearchState = {
  customers: [],
  status: APIResponseStatus.NotStarted,
  page: 0,
  size: 20,
  totalElements: 0,
  sort: '',
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
      if (action.payload.sort !== undefined) {
        state.sort = action.payload.sort;
      }
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

    setSearchQueryFilter(state, action: PayloadAction<string | undefined>) {
      state.searchQueryFilter = action.payload;
    },
    setOrganizerFilter(state, action: PayloadAction<number | undefined>) {
      state.organizerIdFilter = action.payload;
    },
    setExamDateFilter(state, action: PayloadAction<number | undefined>) {
      state.examDateIdFilter = action.payload;
    },
    setLanguageFilter(state, action: PayloadAction<string | undefined>) {
      state.languageCodeFilter = action.payload;
    },
    setLevelFilter(
      state,
      action: PayloadAction<'' | 'PERUS' | 'KESKI' | 'YLIN' | undefined>,
    ) {
      state.levelCodeFilter =
        action.payload === '' ? undefined : action.payload;
    },
    setCustomersSort(state, action: PayloadAction<string>) {
      state.sort = action.payload;
    },
  },
});

export const clerkCustomersSearchReducer = clerkCustomersSearchSlice.reducer;

export const {
  loadCustomersSearch,
  rejectCustomersSearch,
  storeCustomersSearch,
  setSearchQueryFilter,
  setOrganizerFilter,
  setExamDateFilter,
  setLanguageFilter,
  setLevelFilter,
  setCustomersSort,
} = clerkCustomersSearchSlice.actions;
