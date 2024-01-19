import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkTranslator } from 'interfaces/clerkTranslator';

interface ClerkTranslatorOverviewState {
  overviewStatus: APIResponseStatus;
  translatorDetailsStatus: APIResponseStatus;
  translator?: ClerkTranslator;
}

const initialState: ClerkTranslatorOverviewState = {
  overviewStatus: APIResponseStatus.NotStarted,
  translatorDetailsStatus: APIResponseStatus.NotStarted,
  translator: undefined,
};

const clerkTranslatorOverviewSlice = createSlice({
  name: 'clerkTranslatorOverview',
  initialState,
  reducers: {
    cancelClerkTranslatorDetailsUpdate(state) {
      state.translatorDetailsStatus = APIResponseStatus.Cancelled;
    },
    loadClerkTranslatorOverview(state, _action: PayloadAction<number>) {
      state.overviewStatus = APIResponseStatus.InProgress;
    },
    rejectClerkTranslatorDetailsUpdate(state) {
      state.translatorDetailsStatus = APIResponseStatus.Error;
    },
    rejectClerkTranslatorOverview(state) {
      state.overviewStatus = APIResponseStatus.Error;
    },
    resetClerkTranslatorDetailsUpdate(state) {
      state.translatorDetailsStatus = initialState.translatorDetailsStatus;
    },
    resetClerkTranslatorOverview(_state) {
      return initialState;
    },
    setClerkTranslatorOverview(state, action: PayloadAction<ClerkTranslator>) {
      state.overviewStatus = APIResponseStatus.NotStarted;
      state.translator = action.payload;
    },
    setClerkTranslatorOverviewTranslator(
      state,
      action: PayloadAction<ClerkTranslator>,
    ) {
      state.translator = action.payload;
    },
    storeClerkTranslatorOverview(
      state,
      action: PayloadAction<ClerkTranslator>,
    ) {
      state.overviewStatus = APIResponseStatus.Success;
      state.translator = action.payload;
    },
    updateClerkTranslatorDetails(
      state,
      _action: PayloadAction<ClerkTranslator>,
    ) {
      state.translatorDetailsStatus = APIResponseStatus.InProgress;
    },
    updatingClerkTranslatorDetailsSucceeded(
      state,
      action: PayloadAction<ClerkTranslator>,
    ) {
      state.overviewStatus = APIResponseStatus.Success;
      state.translatorDetailsStatus = APIResponseStatus.Success;
      state.translator = action.payload;
    },
  },
});

export const clerkTranslatorOverviewReducer =
  clerkTranslatorOverviewSlice.reducer;
export const {
  cancelClerkTranslatorDetailsUpdate,
  loadClerkTranslatorOverview,
  rejectClerkTranslatorDetailsUpdate,
  rejectClerkTranslatorOverview,
  resetClerkTranslatorDetailsUpdate,
  resetClerkTranslatorOverview,
  setClerkTranslatorOverview,
  setClerkTranslatorOverviewTranslator,
  storeClerkTranslatorOverview,
  updateClerkTranslatorDetails,
  updatingClerkTranslatorDetailsSucceeded,
} = clerkTranslatorOverviewSlice.actions;
