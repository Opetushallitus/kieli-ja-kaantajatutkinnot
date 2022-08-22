import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { APIResponseStatus } from 'shared/enums';

import { Authorisation } from 'interfaces/authorisation';
import { ClerkTranslator } from 'interfaces/clerkTranslator';
import { ResponseState } from 'interfaces/responseState';

interface ClerkTranslatorOverviewState {
  overviewState: ResponseState;
  translatorDetailsState: ResponseState;
  authorisationDetailsState: ResponseState;
  selectedTranslator?: ClerkTranslator;
}

const initialState: ClerkTranslatorOverviewState = {
  overviewState: { status: APIResponseStatus.NotStarted },
  translatorDetailsState: { status: APIResponseStatus.NotStarted },
  authorisationDetailsState: { status: APIResponseStatus.NotStarted },
  selectedTranslator: undefined,
};

const clerkTranslatorOverviewSlice = createSlice({
  name: 'clerkTranslatorOverview',
  initialState,
  reducers: {
    cancelClerkTranslatorDetailsUpdate(state) {
      state.translatorDetailsState.status = APIResponseStatus.Cancelled;
    },
    removeAuthorisation(state, _action: PayloadAction<number>) {
      state.authorisationDetailsState.status = APIResponseStatus.InProgress;
    },
    removingAuthorisationSucceeded(
      state,
      action: PayloadAction<ClerkTranslator>
    ) {
      state.authorisationDetailsState.status = APIResponseStatus.Success;
      state.selectedTranslator = action.payload;
    },
    loadClerkTranslatorOverview(state, _action: PayloadAction<number>) {
      state.overviewState.status = APIResponseStatus.InProgress;
    },
    rejectClerkTranslatorOverview(state, action: PayloadAction<AxiosError>) {
      state.overviewState.status = APIResponseStatus.Error;
      state.overviewState.error = action.payload;
    },
    rejectClerkTranslatorDetailsUpdate(
      state,
      action: PayloadAction<AxiosError>
    ) {
      state.translatorDetailsState.status = APIResponseStatus.Error;
      state.translatorDetailsState.error = action.payload;
    },
    rejectAuthorisationPublishPermissionUpdate(
      state,
      action: PayloadAction<AxiosError>
    ) {
      state.authorisationDetailsState.status = APIResponseStatus.Error;
      state.authorisationDetailsState.error = action.payload;
    },
    rejectAuthorisationRemove(state, action: PayloadAction<AxiosError>) {
      state.authorisationDetailsState.status = APIResponseStatus.Error;
      state.authorisationDetailsState.error = action.payload;
    },
    resetClerkTranslatorDetailsUpdate(state) {
      state.translatorDetailsState = initialState.translatorDetailsState;
    },
    resetClerkTranslatorOverview(state) {
      state.overviewState = initialState.overviewState;
      state.authorisationDetailsState = initialState.authorisationDetailsState;
      state.translatorDetailsState = initialState.translatorDetailsState;
      state.selectedTranslator = initialState.selectedTranslator;
    },
    setClerkTranslatorOverview(state, action: PayloadAction<ClerkTranslator>) {
      state.selectedTranslator = action.payload;
      state.overviewState.status = APIResponseStatus.NotStarted;
    },
    storeClerkTranslatorOverview(
      state,
      action: PayloadAction<ClerkTranslator>
    ) {
      state.overviewState.status = APIResponseStatus.Success;
      state.selectedTranslator = action.payload;
    },
    updateClerkTranslatorDetails(
      state,
      _action: PayloadAction<ClerkTranslator>
    ) {
      state.translatorDetailsState.status = APIResponseStatus.InProgress;
    },
    updateAuthorisationPublishPermission(
      state,
      _action: PayloadAction<Authorisation>
    ) {
      state.authorisationDetailsState.status = APIResponseStatus.InProgress;
    },
    updatingAuthorisationPublishPermissionSucceeded(
      state,
      action: PayloadAction<ClerkTranslator>
    ) {
      state.authorisationDetailsState.status = APIResponseStatus.Success;
      state.selectedTranslator = action.payload;
    },
    updatingClerkTranslatorDetailsSucceeded(
      state,
      action: PayloadAction<ClerkTranslator>
    ) {
      state.overviewState.status = APIResponseStatus.Success;
      state.translatorDetailsState.status = APIResponseStatus.Success;
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
  rejectAuthorisationRemove,
  rejectClerkTranslatorOverview,
  rejectClerkTranslatorDetailsUpdate,
  rejectAuthorisationPublishPermissionUpdate,
  resetClerkTranslatorDetailsUpdate,
  resetClerkTranslatorOverview,
  setClerkTranslatorOverview,
  storeClerkTranslatorOverview,
  updateClerkTranslatorDetails,
  updateAuthorisationPublishPermission,
  updatingAuthorisationPublishPermissionSucceeded,
  updatingClerkTranslatorDetailsSucceeded,
} = clerkTranslatorOverviewSlice.actions;
