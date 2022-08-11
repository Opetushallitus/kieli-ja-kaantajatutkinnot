import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { SearchFilter } from 'enums/app';
import {
  PublicTranslatorFilter,
  PublicTranslatorResponse,
  PublicTranslatorState,
} from 'interfaces/publicTranslator';

const initialState: PublicTranslatorState = {
  status: APIResponseStatus.NotStarted,
  selectedTranslators: [],
  translators: [],
  filters: {
    errors: [],
    fromLang: '',
    toLang: '',
    name: '',
    town: '',
  },
  langs: { from: [], to: [] },
  towns: [],
};

export const publicTranslatorSlice = createSlice({
  name: 'publicTranslator',
  initialState,
  reducers: {
    loadPublicTranslators(state) {
      state.status = APIResponseStatus.InProgress;
    },
    storePublicTranslators(
      state,
      action: PayloadAction<PublicTranslatorResponse>
    ) {
      state.status = APIResponseStatus.Success;
      state.translators = action.payload.translators;
      state.langs = action.payload.langs;
      state.towns = action.payload.towns;
    },
    rejectPublicTranslators(state) {
      state.status = APIResponseStatus.Error;
    },
    addSelectedPublicTranslator(state, action: PayloadAction<number>) {
      state.selectedTranslators.push(action.payload);
    },
    removeSelectedPublicTranslator(state, action: PayloadAction<number>) {
      state.selectedTranslators = state.selectedTranslators.filter(
        (idx) => idx !== action.payload
      );
    },
    emptyPublicTranslatorSelections(state) {
      state.selectedTranslators = initialState.selectedTranslators;
    },
    addPublicTranslatorFilters(
      state,
      action: PayloadAction<PublicTranslatorFilter>
    ) {
      state.filters = { ...state.filters, ...action.payload };
    },
    emptyPublicTranslatorFilters(state) {
      state.filters = initialState.filters;
    },
    addPublicTranslatorFilterError(state, action: PayloadAction<SearchFilter>) {
      state.filters.errors = [...state.filters.errors, action.payload];
    },
    removePublicTranslatorFilterError(
      state,
      action: PayloadAction<SearchFilter>
    ) {
      state.filters.errors = state.filters.errors.filter(
        (f) => f !== action.payload
      );
    },
  },
});

export const publicTranslatorReducer = publicTranslatorSlice.reducer;
export const {
  loadPublicTranslators,
  storePublicTranslators,
  rejectPublicTranslators,
  addSelectedPublicTranslator,
  removeSelectedPublicTranslator,
  emptyPublicTranslatorSelections,
  addPublicTranslatorFilters,
  emptyPublicTranslatorFilters,
  addPublicTranslatorFilterError,
  removePublicTranslatorFilterError,
} = publicTranslatorSlice.actions;
