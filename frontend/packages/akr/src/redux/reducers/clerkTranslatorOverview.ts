import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { Authorisation } from 'interfaces/authorisation';
import { ClerkTranslator } from 'interfaces/clerkTranslator';
import { ClerkTranslatorOverviewState } from 'interfaces/clerkTranslatorOverview';

const initialState: ClerkTranslatorOverviewState = {
  overviewStatus: APIResponseStatus.NotStarted,
  translatorDetailsStatus: APIResponseStatus.NotStarted,
  authorisationDetailsStatus: APIResponseStatus.NotStarted,
  selectedTranslator: undefined,
};

const clerkTranslatorOverviewSlice = createSlice({
  name: 'clerkTranslatorOverview',
  initialState,
  reducers: {
    cancelClerkTranslatorDetailsUpdate(state) {
      state.translatorDetailsStatus = APIResponseStatus.Cancelled;
    },
    removeAuthorisation(state, _action: PayloadAction<number>) {
      state.authorisationDetailsStatus = APIResponseStatus.InProgress;
    },
    removingAuthorisationSucceeded(
      state,
      action: PayloadAction<ClerkTranslator>
    ) {
      state.authorisationDetailsStatus = APIResponseStatus.Success;
      state.selectedTranslator = action.payload;
    },
    loadClerkTranslatorOverview(state, action: PayloadAction<ClerkTranslator>) {
      state.selectedTranslator = action.payload;
      state.overviewStatus = APIResponseStatus.NotStarted;
    },
    loadClerkTranslatorOverviewWithId(state, _action: PayloadAction<number>) {
      state.overviewStatus = APIResponseStatus.InProgress;
    },
    loadingClerkTranslatorOverviewSucceeded(
      state,
      action: PayloadAction<ClerkTranslator>
    ) {
      state.overviewStatus = APIResponseStatus.Success;
      state.selectedTranslator = action.payload;
    },
    rejectClerkTranslatorOverview(state) {
      state.overviewStatus = APIResponseStatus.Error;
    },
    rejectClerkTranslatorDetailsUpdate(state) {
      state.translatorDetailsStatus = APIResponseStatus.Error;
    },
    rejectAuthorisationPublishPermissionUpdate(state) {
      state.authorisationDetailsStatus = APIResponseStatus.Error;
    },
    rejectAuthorisationRemove(state) {
      state.authorisationDetailsStatus = APIResponseStatus.Error;
    },
    resetClerkTranslatorDetailsUpdate(state) {
      state.translatorDetailsStatus = APIResponseStatus.NotStarted;
    },
    resetClerkTranslatorOverview(state) {
      state.authorisationDetailsStatus =
        initialState.authorisationDetailsStatus;
      state.overviewStatus = initialState.overviewStatus;
      state.selectedTranslator = initialState.selectedTranslator;
      state.translatorDetailsStatus = initialState.translatorDetailsStatus;
    },
    updateClerkTranslatorDetails(
      state,
      _action: PayloadAction<ClerkTranslator>
    ) {
      state.translatorDetailsStatus = APIResponseStatus.InProgress;
    },
    updateAuthorisationPublishPermission(
      state,
      _action: PayloadAction<Authorisation>
    ) {
      state.authorisationDetailsStatus = APIResponseStatus.InProgress;
    },
    updatingAuthorisationPublishPermissionSucceeded(
      state,
      action: PayloadAction<ClerkTranslator>
    ) {
      state.authorisationDetailsStatus = APIResponseStatus.Success;
      state.selectedTranslator = action.payload;
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
  removeAuthorisation,
  removingAuthorisationSucceeded,
  loadClerkTranslatorOverview,
  loadClerkTranslatorOverviewWithId,
  loadingClerkTranslatorOverviewSucceeded,
  rejectAuthorisationRemove,
  rejectClerkTranslatorOverview,
  rejectClerkTranslatorDetailsUpdate,
  rejectAuthorisationPublishPermissionUpdate,
  resetClerkTranslatorDetailsUpdate,
  resetClerkTranslatorOverview,
  updateClerkTranslatorDetails,
  updateAuthorisationPublishPermission,
  updatingAuthorisationPublishPermissionSucceeded,
  updatingClerkTranslatorDetailsSucceeded,
} = clerkTranslatorOverviewSlice.actions;
