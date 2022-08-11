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
    loadClerkTranslatorOverviewWithId(state, _action: PayloadAction<number>) {
      state.overviewStatus = APIResponseStatus.NotStarted;
    },
    loadClerkTranslatorOverview(state, action: PayloadAction<ClerkTranslator>) {
      state.selectedTranslator = action.payload;
      state.overviewStatus = APIResponseStatus.NotStarted;
    },
    loadingClerkTranslatorOverview(state) {
      state.overviewStatus = APIResponseStatus.InProgress;
    },
    updateClerkTranslatorDetails(
      state,
      _action: PayloadAction<ClerkTranslator>
    ) {
      state.translatorDetailsStatus = APIResponseStatus.InProgress;
    },
    cancelClerkTranslatorDetailsUpdate(state) {
      state.translatorDetailsStatus = APIResponseStatus.Cancelled;
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
    loadingClerkTranslatorOverviewSucceeded(
      state,
      action: PayloadAction<ClerkTranslator>
    ) {
      state.overviewStatus = APIResponseStatus.Success;
      state.selectedTranslator = action.payload;
    },
    updatingCLerkTranslatorDetailsSucceeded(
      state,
      action: PayloadAction<ClerkTranslator>
    ) {
      state.overviewStatus = APIResponseStatus.Success;
      state.translatorDetailsStatus = APIResponseStatus.Success;
      state.selectedTranslator = action.payload;
    },
    rejectClerkTranslatorOverview(state) {
      state.overviewStatus = APIResponseStatus.Error;
    },
    rejectClerkTranslatorDetailsUpdate(state) {
      state.translatorDetailsStatus = APIResponseStatus.Error;
    },
    updateClerkTranslatorPublishPermission(
      state,
      _action: PayloadAction<Authorisation>
    ) {
      state.authorisationDetailsStatus = APIResponseStatus.InProgress;
    },
    updatingClerkTranslatorPublishPermissionSucceeded(
      state,
      action: PayloadAction<ClerkTranslator>
    ) {
      state.authorisationDetailsStatus = APIResponseStatus.Success;
      state.selectedTranslator = action.payload;
    },
    rejectClerkTranslatorPublishPermissionUpdate(state) {
      state.authorisationDetailsStatus = APIResponseStatus.Error;
    },
    deleteClerkTranslatorAuthorisation(state, _action: PayloadAction<number>) {
      state.authorisationDetailsStatus = APIResponseStatus.InProgress;
    },
    deletingClerkTranslatorAuthorisationSucceeded(
      state,
      action: PayloadAction<ClerkTranslator>
    ) {
      state.authorisationDetailsStatus = APIResponseStatus.Success;
      state.selectedTranslator = action.payload;
    },
    rejectClerkTranslatorAuthorisationDelete(state) {
      state.authorisationDetailsStatus = APIResponseStatus.Error;
    },
  },
});

export const clerkTranslatorOverviewReducer =
  clerkTranslatorOverviewSlice.reducer;
export const {
  loadClerkTranslatorOverview,
  loadClerkTranslatorOverviewWithId,
  loadingClerkTranslatorOverview,
  updateClerkTranslatorDetails,
  cancelClerkTranslatorDetailsUpdate,
  resetClerkTranslatorDetailsUpdate,
  resetClerkTranslatorOverview,
  loadingClerkTranslatorOverviewSucceeded,
  rejectClerkTranslatorOverview,
  updatingCLerkTranslatorDetailsSucceeded,
  rejectClerkTranslatorDetailsUpdate,
  updateClerkTranslatorPublishPermission,
  updatingClerkTranslatorPublishPermissionSucceeded,
  rejectClerkTranslatorPublishPermissionUpdate,
  deleteClerkTranslatorAuthorisation,
  deletingClerkTranslatorAuthorisationSucceeded,
  rejectClerkTranslatorAuthorisationDelete,
} = clerkTranslatorOverviewSlice.actions;
