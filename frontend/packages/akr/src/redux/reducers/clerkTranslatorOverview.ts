import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkTranslator } from 'interfaces/clerkTranslator';

interface ClerkTranslatorOverviewState {
  overviewStatus: APIResponseStatus;
  translatorDetailsStatus: APIResponseStatus;
  selectedTranslator?: ClerkTranslator;
}

const initialState: ClerkTranslatorOverviewState = {
  overviewStatus: APIResponseStatus.NotStarted,
  translatorDetailsStatus: APIResponseStatus.NotStarted,
  selectedTranslator: undefined,
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
    resetClerkTranslatorOverview(state) {
      state.overviewStatus = initialState.overviewStatus;
      state.translatorDetailsStatus = initialState.translatorDetailsStatus;
      state.selectedTranslator = initialState.selectedTranslator;
    },
    setClerkTranslatorOverview(state, action: PayloadAction<ClerkTranslator>) {
      state.overviewStatus = APIResponseStatus.NotStarted;
      state.selectedTranslator = action.payload;
    },
    setSelectedTranslator(state, action: PayloadAction<ClerkTranslator>) {
      state.selectedTranslator = action.payload;
    },
    storeClerkTranslatorOverview(
      state,
      action: PayloadAction<ClerkTranslator>
    ) {
      state.overviewStatus = APIResponseStatus.Success;
      state.selectedTranslator = action.payload;
    },
    updateClerkTranslatorDetails(
      state,
      _action: PayloadAction<ClerkTranslator>
    ) {
      state.translatorDetailsStatus = APIResponseStatus.InProgress;
    },
    updatingClerkTranslatorDetailsSucceeded(
      state,
      action: PayloadAction<ClerkTranslator>
    ) {
      state.overviewStatus = APIResponseStatus.Success;
      state.translatorDetailsStatus = APIResponseStatus.Success;
      state.selectedTranslator = action.payload;
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
  setSelectedTranslator,
  storeClerkTranslatorOverview,
  updateClerkTranslatorDetails,
  updatingClerkTranslatorDetailsSucceeded,
} = clerkTranslatorOverviewSlice.actions;
