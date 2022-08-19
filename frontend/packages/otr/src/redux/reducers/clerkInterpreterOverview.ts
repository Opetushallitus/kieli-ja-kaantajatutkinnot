import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';
import { WithId } from 'shared/interfaces';

import {
  ClerkInterpreter,
  ClerkInterpreterOverviewState,
} from 'interfaces/clerkInterpreter';

const initialState: ClerkInterpreterOverviewState = {
  interpreter: undefined,
  overviewStatus: APIResponseStatus.NotStarted,
  interpreterDetailsUpdateStatus: APIResponseStatus.NotStarted,
};

const clerkInterpreterOverviewSlice = createSlice({
  name: 'clerkInterpreterOverview',
  initialState,
  reducers: {
    loadClerkInterpreterOverview(state, _action: PayloadAction<WithId>) {
      state.overviewStatus = APIResponseStatus.InProgress;
    },
    setClerkInterpreterOverview(
      state,
      action: PayloadAction<ClerkInterpreter>
    ) {
      state.interpreter = action.payload;
    },
    storeClerkInterpreterOverview(
      state,
      action: PayloadAction<ClerkInterpreter>
    ) {
      state.overviewStatus = APIResponseStatus.Success;
      state.interpreter = action.payload;
    },
    rejectLoadClerkInterpreterOverview(state) {
      state.overviewStatus = APIResponseStatus.Error;
    },
    resetClerkInterpreterOverview(state) {
      state.overviewStatus = initialState.overviewStatus;
      state.interpreter = initialState.interpreter;
      state.interpreterDetailsUpdateStatus =
        initialState.interpreterDetailsUpdateStatus;
    },
    resetClerkInterpreterDetailsUpdate(state) {
      state.interpreterDetailsUpdateStatus =
        initialState.interpreterDetailsUpdateStatus;
    },
    updateClerkInterpreterDetails(
      state,
      _action: PayloadAction<ClerkInterpreter>
    ) {
      state.interpreterDetailsUpdateStatus = APIResponseStatus.InProgress;
    },
    storeClerkInterpreterOverviewUpdate(
      state,
      action: PayloadAction<ClerkInterpreter>
    ) {
      state.interpreterDetailsUpdateStatus = APIResponseStatus.Success;
      state.interpreter = action.payload;
    },
    rejectClerkInterpreterOverviewUpdate(state) {
      state.interpreterDetailsUpdateStatus = APIResponseStatus.Error;
    },
  },
});

export const clerkInterpreterOverviewReducer =
  clerkInterpreterOverviewSlice.reducer;
export const {
  loadClerkInterpreterOverview,
  setClerkInterpreterOverview,
  storeClerkInterpreterOverview,
  rejectLoadClerkInterpreterOverview,
  resetClerkInterpreterOverview,
  resetClerkInterpreterDetailsUpdate,
  updateClerkInterpreterDetails,
  rejectClerkInterpreterOverviewUpdate,
  storeClerkInterpreterOverviewUpdate,
} = clerkInterpreterOverviewSlice.actions;
