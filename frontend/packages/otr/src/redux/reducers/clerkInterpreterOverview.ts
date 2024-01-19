import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkInterpreter } from 'interfaces/clerkInterpreter';

interface ClerkInterpreterOverviewState {
  interpreter?: ClerkInterpreter;
  overviewStatus: APIResponseStatus;
  interpreterDetailsStatus: APIResponseStatus;
}

const initialState: ClerkInterpreterOverviewState = {
  interpreter: undefined,
  overviewStatus: APIResponseStatus.NotStarted,
  interpreterDetailsStatus: APIResponseStatus.NotStarted,
};

const clerkInterpreterOverviewSlice = createSlice({
  name: 'clerkInterpreterOverview',
  initialState,
  reducers: {
    loadClerkInterpreterOverview(state, _action: PayloadAction<number>) {
      state.overviewStatus = APIResponseStatus.InProgress;
    },
    rejectClerkInterpreterDetailsUpdate(state) {
      state.interpreterDetailsStatus = APIResponseStatus.Error;
    },
    rejectClerkInterpreterOverview(state) {
      state.overviewStatus = APIResponseStatus.Error;
    },
    resetClerkInterpreterDetailsUpdate(state) {
      state.interpreterDetailsStatus = initialState.interpreterDetailsStatus;
    },
    resetClerkInterpreterOverview(state) {
      state.overviewStatus = initialState.overviewStatus;
      state.interpreter = initialState.interpreter;
      state.interpreterDetailsStatus = initialState.interpreterDetailsStatus;
    },
    setClerkInterpreterOverview(
      state,
      action: PayloadAction<ClerkInterpreter>,
    ) {
      state.interpreter = action.payload;
    },
    storeClerkInterpreterOverview(
      state,
      action: PayloadAction<ClerkInterpreter>,
    ) {
      state.overviewStatus = APIResponseStatus.Success;
      state.interpreter = action.payload;
    },
    updateClerkInterpreterDetails(
      state,
      _action: PayloadAction<ClerkInterpreter>,
    ) {
      state.interpreterDetailsStatus = APIResponseStatus.InProgress;
    },
    updatingClerkInterpreterDetailsSucceeded(
      state,
      action: PayloadAction<ClerkInterpreter>,
    ) {
      state.interpreterDetailsStatus = APIResponseStatus.Success;
      state.interpreter = action.payload;
    },
  },
});

export const clerkInterpreterOverviewReducer =
  clerkInterpreterOverviewSlice.reducer;
export const {
  loadClerkInterpreterOverview,
  rejectClerkInterpreterDetailsUpdate,
  rejectClerkInterpreterOverview,
  resetClerkInterpreterDetailsUpdate,
  resetClerkInterpreterOverview,
  setClerkInterpreterOverview,
  storeClerkInterpreterOverview,
  updateClerkInterpreterDetails,
  updatingClerkInterpreterDetailsSucceeded,
} = clerkInterpreterOverviewSlice.actions;
