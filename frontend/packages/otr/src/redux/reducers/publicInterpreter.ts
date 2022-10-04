import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  PublicInterpreter,
  PublicInterpreterFilter,
} from 'interfaces/publicInterpreter';
import { QualificationUtils } from 'utils/qualifications';

interface PublicInterpreterState {
  status: APIResponseStatus;
  interpreters: Array<PublicInterpreter>;
  filters: PublicInterpreterFilter;
}

const initialState: PublicInterpreterState = {
  status: APIResponseStatus.NotStarted,
  interpreters: [],
  filters: {
    fromLang: QualificationUtils.defaultFromLang,
    toLang: '',
    name: '',
    region: '',
  },
};

const publicInterpreterSlice = createSlice({
  name: 'publicInterpreter',
  initialState,
  reducers: {
    emptyPublicInterpreterFilters(state) {
      state.filters = initialState.filters;
    },
    loadPublicInterpreters(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectPublicInterpreters(state) {
      state.status = APIResponseStatus.Error;
    },
    setPublicInterpreterFilters(
      state,
      action: PayloadAction<PublicInterpreterFilter>
    ) {
      state.filters = action.payload;
    },
    storePublicInterpreters(
      state,
      action: PayloadAction<Array<PublicInterpreter>>
    ) {
      state.status = APIResponseStatus.Success;
      state.interpreters = action.payload;
    },
  },
});

export const publicInterpreterReducer = publicInterpreterSlice.reducer;
export const {
  emptyPublicInterpreterFilters,
  loadPublicInterpreters,
  rejectPublicInterpreters,
  setPublicInterpreterFilters,
  storePublicInterpreters,
} = publicInterpreterSlice.actions;
