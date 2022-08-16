import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { AuthorisationStatus } from 'enums/clerkTranslator';
import { ClerkState } from 'interfaces/clerkState';
import { ClerkTranslatorFilter } from 'interfaces/clerkTranslator';

interface ClerkUIState extends ClerkState {
  selectedTranslators: Array<number>;
  status: APIResponseStatus;
  filters: ClerkTranslatorFilter;
}

const initialState: ClerkUIState = {
  status: APIResponseStatus.NotStarted,
  translators: [],
  langs: { from: [], to: [] },
  meetingDates: [],
  examinationDates: [],
  selectedTranslators: [],
  filters: {
    authorisationStatus: AuthorisationStatus.Authorised,
  },
};

const clerkTranslatorSlice = createSlice({
  name: 'clerkTranslator',
  initialState,
  reducers: {
    addClerkTranslatorFilter(
      state,
      action: PayloadAction<Partial<ClerkTranslatorFilter>>
    ) {
      state.filters = { ...state.filters, ...action.payload };
    },
    deselectAllClerkTranslators(state) {
      state.selectedTranslators = initialState.selectedTranslators;
    },
    deselectClerkTranslator(state, action: PayloadAction<number>) {
      state.selectedTranslators = state.selectedTranslators.filter(
        (id) => id !== action.payload
      );
    },
    loadClerkTranslators(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectClerkTranslators(state) {
      state.status = APIResponseStatus.Error;
    },
    resetClerkTranslatorFilters(state) {
      state.filters = initialState.filters;
      state.selectedTranslators = initialState.selectedTranslators;
    },
    selectAllFilteredClerkTranslators(state) {
      state.selectedTranslators = state.translators.map(({ id }) => id);
    },
    selectClerkTranslator(state, action: PayloadAction<number>) {
      state.selectedTranslators.push(action.payload);
    },
    storeClerkTranslators(state, action: PayloadAction<ClerkState>) {
      state.status = APIResponseStatus.Success;
      state.translators = action.payload.translators;
      state.langs = action.payload.langs;
      state.meetingDates = action.payload.meetingDates;
      state.examinationDates = action.payload.examinationDates;
    },
  },
});

export const clerkTranslatorReducer = clerkTranslatorSlice.reducer;
export const {
  addClerkTranslatorFilter,
  deselectAllClerkTranslators,
  deselectClerkTranslator,
  loadClerkTranslators,
  rejectClerkTranslators,
  resetClerkTranslatorFilters,
  selectAllFilteredClerkTranslators,
  selectClerkTranslator,
  storeClerkTranslators,
} = clerkTranslatorSlice.actions;
