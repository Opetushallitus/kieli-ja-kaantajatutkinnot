import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { SearchFilter } from 'enums/app';
import { PaginationState } from 'interfaces/pagination';
import {
  PublicTranslatorFilter,
  PublicTranslatorResponse,
} from 'interfaces/publicTranslator';

interface PublicTranslatorState extends PublicTranslatorResponse {
  status: APIResponseStatus;
  selectedTranslators: Array<number>;
  filters: PublicTranslatorFilter;
  pagination: PaginationState;
}

const initialState: PublicTranslatorState = {
  status: APIResponseStatus.NotStarted,
  selectedTranslators: [],
  translators: [],
  filters: {
    fromLang: '',
    toLang: '',
    name: '',
    town: '',
    errors: [],
  },
  langs: { from: [], to: [] },
  towns: [],
  pagination: {
    page: 0,
    rowsPerPage: 10,
  },
};

const publicTranslatorSlice = createSlice({
  name: 'publicTranslator',
  initialState,
  reducers: {
    addPublicTranslatorFilterError(state, action: PayloadAction<SearchFilter>) {
      state.filters.errors.push(action.payload);
    },
    deselectAllPublicTranslators(state) {
      state.selectedTranslators = initialState.selectedTranslators;
    },
    deselectPublicTranslator(state, action: PayloadAction<number>) {
      state.selectedTranslators = state.selectedTranslators.filter(
        (id) => id !== action.payload
      );
    },
    emptyPublicTranslatorFilters(state) {
      state.filters = initialState.filters;
    },
    loadPublicTranslators(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectPublicTranslators(state) {
      state.status = APIResponseStatus.Error;
    },
    removePublicTranslatorFilterError(
      state,
      action: PayloadAction<SearchFilter>
    ) {
      state.filters.errors = state.filters.errors.filter(
        (f) => f !== action.payload
      );
    },
    selectPublicTranslator(state, action: PayloadAction<number>) {
      state.selectedTranslators.push(action.payload);
    },
    setPublicTranslatorFilters(
      state,
      action: PayloadAction<PublicTranslatorFilter>
    ) {
      state.filters = action.payload;
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
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
    setRowsPerPage(state, action: PayloadAction<number>) {
      state.pagination.rowsPerPage = action.payload;
    },
  },
});

export const publicTranslatorReducer = publicTranslatorSlice.reducer;
export const {
  addPublicTranslatorFilterError,
  deselectAllPublicTranslators,
  deselectPublicTranslator,
  emptyPublicTranslatorFilters,
  loadPublicTranslators,
  rejectPublicTranslators,
  removePublicTranslatorFilterError,
  selectPublicTranslator,
  setPublicTranslatorFilters,
  storePublicTranslators,
  setPage,
  setRowsPerPage,
} = publicTranslatorSlice.actions;
