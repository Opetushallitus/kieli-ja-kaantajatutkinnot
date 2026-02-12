import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkCustomerDetails,
  ClerkPersonContactUpdateRequest,
} from 'interfaces/clerkCustomer';

interface ClerkCustomerDetailsState {
  customerDetails: ClerkCustomerDetails | null;
  status: APIResponseStatus;
}

const initialState: ClerkCustomerDetailsState = {
  customerDetails: null,
  status: APIResponseStatus.NotStarted,
};

const clerkCustomerDetailsSlice = createSlice({
  name: 'customerDetails',
  initialState,
  reducers: {
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
      state.status = APIResponseStatus.InProgress;
    },
  },
});

export const clerkCustomerDetailsReducer = clerkCustomerDetailsSlice.reducer;
export const {
  loadClerkCustomerDetails,
  rejectCustomerDetails,
  storeCustomerDetails,
  updateCustomerContactDetails,
} = clerkCustomerDetailsSlice.actions;
