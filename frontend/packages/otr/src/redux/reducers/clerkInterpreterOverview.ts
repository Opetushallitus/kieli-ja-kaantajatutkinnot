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
  interpreterDetailsStatus: APIResponseStatus.NotStarted,
  authorisationDetailsStatus: APIResponseStatus.NotStarted,
};

const clerkInterpreterOverviewSlice = createSlice({
  name: 'clerkInterpreterOverview',
  initialState,
  reducers: {
    loadClerkInterpreterOverview(state, _action: PayloadAction<WithId>) {
      state.overviewStatus = APIResponseStatus.InProgress;
    },
    storeClerkInterpreterOverview(
      state,
      action: PayloadAction<ClerkInterpreter>
    ) {
      state.overviewStatus = APIResponseStatus.Success;
      state.interpreter = action.payload;
    },
    loadingClerkInterpreterOverviewFailed(state) {
      state.overviewStatus = APIResponseStatus.Error;
    },
    resetClerkInterpreterOverview(state) {
      state.overviewStatus = initialState.overviewStatus;
      state.interpreter = initialState.interpreter;
    },
    resetClerkInterpreterDetailsUpdate(state) {
      state.interpreterDetailsStatus = initialState.interpreterDetailsStatus;
    },
    updateClerkInterpreterDetails(state) {
      state.interpreterDetailsStatus = APIResponseStatus.InProgress;
    },
  },
});

export const clerkInterpreterOverviewReducer =
  clerkInterpreterOverviewSlice.reducer;
export const {
  loadClerkInterpreterOverview,
  storeClerkInterpreterOverview,
  loadingClerkInterpreterOverviewFailed,
  resetClerkInterpreterOverview,
  resetClerkInterpreterDetailsUpdate,
  updateClerkInterpreterDetails,
} = clerkInterpreterOverviewSlice.actions;
