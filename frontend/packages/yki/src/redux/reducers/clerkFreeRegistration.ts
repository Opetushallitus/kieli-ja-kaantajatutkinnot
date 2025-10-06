import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkFreeRegistration } from 'interfaces/clerkFreeRegistration';

type FreeRegistrationColumnIds =
  | 'person'
  | 'status'
  | 'dueDate'
  | 'examDate'
  | 'registration';
export type FreeRegistrationSort =
  | `${FreeRegistrationColumnIds}:${'asc' | 'desc'}`
  | '';

interface ClerkFreeRegistrationState {
  freeRegistrations: Array<ClerkFreeRegistration>;
  status: APIResponseStatus;
  sort: FreeRegistrationSort;
}

const initialState: ClerkFreeRegistrationState = {
  freeRegistrations: [],
  status: APIResponseStatus.NotStarted,
  sort: '',
};

const clerkFreeRegistrationSlice = createSlice({
  name: 'clerkFreeRegistration',
  initialState,
  reducers: {
    loadClerkFreeRegistrations(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectClerkFreeRegistrations(state) {
      state.status = APIResponseStatus.Error;
    },
    storeClerkFreeRegistrations(
      state,
      action: PayloadAction<Array<ClerkFreeRegistration>>,
    ) {
      state.status = APIResponseStatus.Success;
      state.freeRegistrations = action.payload;
    },
    setSort(state, action: PayloadAction<FreeRegistrationSort>) {
      state.sort = action.payload;
    },
  },
});

export const clerkFreeRegistrationReducer = clerkFreeRegistrationSlice.reducer;
export const {
  loadClerkFreeRegistrations,
  rejectClerkFreeRegistrations,
  storeClerkFreeRegistrations,
} = clerkFreeRegistrationSlice.actions;
