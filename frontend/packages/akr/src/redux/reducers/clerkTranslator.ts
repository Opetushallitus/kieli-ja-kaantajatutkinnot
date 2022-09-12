import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { AuthorisationStatus } from 'enums/clerkTranslator';
import {
  ClerkTranslator,
  ClerkTranslatorFilter,
} from 'interfaces/clerkTranslator';
import { LanguagePairsDict } from 'interfaces/languagePair';

interface ClerkState {
  translators: Array<ClerkTranslator>;
  langs: LanguagePairsDict;
}

interface ClerkUIState extends ClerkState {
  selectedTranslators: Array<number>;
  status: APIResponseStatus;
  filters: ClerkTranslatorFilter;
}

const initialState: ClerkUIState = {
  status: APIResponseStatus.NotStarted,
  translators: [],
  langs: { from: [], to: [] },
  selectedTranslators: [],
  filters: {
    authorisationStatus: AuthorisationStatus.Effective,
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
    selectAllFilteredClerkTranslators(
      state,
      action: PayloadAction<Array<ClerkTranslator>>
    ) {
      state.selectedTranslators = action.payload.map(({ id }) => id);
    },
    selectClerkTranslator(state, action: PayloadAction<number>) {
      state.selectedTranslators.push(action.payload);
    },
    storeClerkTranslators(state, action: PayloadAction<ClerkState>) {
      state.status = APIResponseStatus.Success;
      state.translators = action.payload.translators;
      state.langs = action.payload.langs;
    },
    upsertClerkTranslator(state, action: PayloadAction<ClerkTranslator>) {
      const updatedTranslators = [...state.translators];
      const translator = action.payload;
      const idx = updatedTranslators.findIndex(
        (t: ClerkTranslator) => t.id === translator.id
      );
      const spliceIndex = idx >= 0 ? idx : updatedTranslators.length;

      updatedTranslators.splice(spliceIndex, 1, translator);
      state.translators = updatedTranslators;
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
  upsertClerkTranslator,
} = clerkTranslatorSlice.actions;
