import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  PublicInterpreter,
  PublicInterpreterFilter,
  PublicInterpreterState,
} from 'interfaces/publicInterpreter';

const initialState: PublicInterpreterState = {
  status: APIResponseStatus.NotStarted,
  interpreters: [],
  filters: {
    fromLang: '',
    toLang: '',
    name: '',
    region: '',
  },
};

const publicInterpreterSlice = createSlice({
  name: 'publicInterpreter',
  initialState,
  reducers: {
    loadPublicInterpreters(state) {
      state.status = APIResponseStatus.InProgress;
    },
    addPublicInterpreterFilter(
      state,
      action: PayloadAction<PublicInterpreterFilter>
    ) {
      state.filters = { ...state.filters, ...action.payload };
    },
    emptyPublicInterpreterFilters(state) {
      state.filters = initialState.filters;
    },
    storePublicInterpreters(
      state,
      action: PayloadAction<Array<PublicInterpreter>>
    ) {
      state.status = APIResponseStatus.Success;
      state.interpreters = action.payload;
    },
    loadingPublicInterpretersFailed(state) {
      state.status = APIResponseStatus.Error;
    },
  },
});

export const publicInterpreterReducer = publicInterpreterSlice.reducer;
export const {
  loadPublicInterpreters,
  addPublicInterpreterFilter,
  emptyPublicInterpreterFilters,
  storePublicInterpreters,
  loadingPublicInterpretersFailed,
} = publicInterpreterSlice.actions;
