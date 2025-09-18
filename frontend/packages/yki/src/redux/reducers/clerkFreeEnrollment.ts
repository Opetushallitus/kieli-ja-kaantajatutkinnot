import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkFreeEnrollment,
  ClerkFreeEnrollmentFilters,
} from 'interfaces/clerkFreeEnrollment';

interface ClerkFreeEnrollmentState {
  freeEnrollments: Array<ClerkFreeEnrollment>;
  status: APIResponseStatus;
  filters: ClerkFreeEnrollmentFilters;
}

const initialState: ClerkFreeEnrollmentState = {
  freeEnrollments: [],
  status: APIResponseStatus.NotStarted,
  filters: {},
};

const clerkFreeEnrollmentSlice = createSlice({
  name: 'clerkFreeEnrollment',
  initialState,
  reducers: {
    addClerkFreeEnrollmentFilter(
      state,
      action: PayloadAction<Partial<ClerkFreeEnrollmentFilters>>,
    ) {
      state.filters = { ...state.filters, ...action.payload };
    },
    loadClerkFreeEnrollments(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectClerkFreeEnrollments(state) {
      state.status = APIResponseStatus.Error;
    },
    storeClerkFreeEnrollments(
      state,
      action: PayloadAction<Array<ClerkFreeEnrollment>>,
    ) {
      state.status = APIResponseStatus.Success;
      state.freeEnrollments = action.payload;
    },
  },
});

export const clerkFreeEnrollmentReducer = clerkFreeEnrollmentSlice.reducer;
export const {
  addClerkFreeEnrollmentFilter,
  loadClerkFreeEnrollments,
  rejectClerkFreeEnrollments,
  storeClerkFreeEnrollments,
} = clerkFreeEnrollmentSlice.actions;
