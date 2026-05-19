import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkCustomerDetails,
  ClerkPersonContactUpdateRequest,
} from 'interfaces/clerkCustomer';

interface ClerkCustomerDetailsState {
  customerDetails: ClerkCustomerDetails | null;
  status: APIResponseStatus;
  updateStatus: APIResponseStatus;
}

const initialState: ClerkCustomerDetailsState = {
  customerDetails: null,
  status: APIResponseStatus.NotStarted,
  updateStatus: APIResponseStatus.NotStarted,
};

const clerkCustomerDetailsSlice = createSlice({
  name: 'customerDetails',
  initialState,
  reducers: {
    loadOrganizerCustomerDetails(
      state,
      _action: PayloadAction<{ oid: string; personOid: string }>,
    ) {
      state.status = APIResponseStatus.InProgress;
    },
    loadClerkCustomerDetails(state, _action: PayloadAction<string>) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectCustomerDetails(state) {
      state.status = APIResponseStatus.Error;
    },
    storeCustomerDetails(state, action: PayloadAction<ClerkCustomerDetails>) {
      state.status = APIResponseStatus.Success;
      state.customerDetails = action.payload;
    },
    updateCustomerContactDetails(
      state,
      _action: PayloadAction<ClerkPersonContactUpdateRequest>,
    ) {
      state.updateStatus = APIResponseStatus.InProgress;
    },
    resolveCustomerContactUpdate(state) {
      state.updateStatus = APIResponseStatus.Success;
    },
    rejectCustomerContactUpdate(state) {
      state.updateStatus = APIResponseStatus.Error;
    },
    resetCustomerContactUpdateStatus(state) {
      state.updateStatus = APIResponseStatus.NotStarted;
    },
    resetCustomerDetails() {
      return initialState;
    },
  },
});

export const clerkCustomerDetailsReducer = clerkCustomerDetailsSlice.reducer;
export const {
  loadOrganizerCustomerDetails,
  loadClerkCustomerDetails,
  rejectCustomerDetails,
  storeCustomerDetails,
  updateCustomerContactDetails,
  resolveCustomerContactUpdate,
  rejectCustomerContactUpdate,
  resetCustomerContactUpdateStatus,
  resetCustomerDetails,
} = clerkCustomerDetailsSlice.actions;
