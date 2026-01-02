import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkCustomerSearchParams,
  ClerkCustomerSummary,
} from 'interfaces/clerkCustomer';

interface ClerkCustomersSearchState {
  customers: ClerkCustomerSummary[] | null;
  status: APIResponseStatus;
}

const initialState: ClerkCustomersSearchState = {
  customers: null,
  status: APIResponseStatus.NotStarted,
};

const clerkCustomersSearchSlice = createSlice({
  name: 'customersSearch',
  initialState,
  reducers: {
    loadCustomersSearch(
      state,
      _action: PayloadAction<ClerkCustomerSearchParams>,
    ) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectCustomersSearch(state) {
      state.status = APIResponseStatus.Error;
    },
    storeCustomersSearch(state, action: PayloadAction<ClerkCustomerSummary[]>) {
      state.status = APIResponseStatus.Success;
      state.customers = action.payload;
    },
  },
});

export const clerkCustomersSearchReducer = clerkCustomersSearchSlice.reducer;

export const {
  loadCustomersSearch,
  rejectCustomersSearch,
  storeCustomersSearch,
} = clerkCustomersSearchSlice.actions;
