import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';
import { WithId } from 'shared/interfaces';

import {
  ClerkInterpreter,
  ClerkInterpreterOverviewState,
} from 'interfaces/clerkInterpreter';

const initialState: ClerkInterpreterOverviewState = {
  interpreter: undefined,
  status: APIResponseStatus.NotStarted,
  interpreterDetailsStatus: APIResponseStatus.NotStarted,
};

const clerkInterpreterOverviewSlice = createSlice({
  name: 'clerkInterpreterOverview',
  initialState,
  reducers: {
    loadClerkInterpreterOverview(state, _action: PayloadAction<WithId>) {
      state.status = APIResponseStatus.InProgress;
    },
    storeClerkInterpreterOverview(
      state,
      action: PayloadAction<ClerkInterpreter>
    ) {
      state.status = APIResponseStatus.Success;
      state.interpreter = action.payload;
    },
    loadingClerkInterpreterOverviewFailed(state) {
      state.status = APIResponseStatus.Error;
    },
    resetClerkInterpreterOverview(state) {
      state.status = initialState.status;
      state.interpreter = initialState.interpreter;
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
} = clerkInterpreterOverviewSlice.actions;
