import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkFreeEnrollment } from 'interfaces/clerkFreeEnrollment';

type FreeEnrollmentColumnIds =
  | 'person'
  | 'status'
  | 'dueDate'
  | 'examDate'
  | 'registration';
export type FreeEnrollmentSort =
  | `${FreeEnrollmentColumnIds}:${'asc' | 'desc'}`
  | '';

interface ClerkFreeEnrollmentState {
  freeEnrollments: Array<ClerkFreeEnrollment>;
  status: APIResponseStatus;
  sort: FreeEnrollmentSort;
}

const initialState: ClerkFreeEnrollmentState = {
  freeEnrollments: [],
  status: APIResponseStatus.NotStarted,
  sort: '',
};

const clerkFreeEnrollmentSlice = createSlice({
  name: 'clerkFreeEnrollment',
  initialState,
  reducers: {
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
    setSort(state, action: PayloadAction<FreeEnrollmentSort>) {
      state.sort = action.payload;
    },
  },
});

export const clerkFreeEnrollmentReducer = clerkFreeEnrollmentSlice.reducer;
export const {
  loadClerkFreeEnrollments,
  rejectClerkFreeEnrollments,
  storeClerkFreeEnrollments,
} = clerkFreeEnrollmentSlice.actions;
