import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { QualificationStatus } from 'enums/interpreter';
import {
  ClerkInterpreter,
  ClerkInterpreterFilters,
  ClerkInterpreterState,
} from 'interfaces/clerkInterpreter';

const initialState: ClerkInterpreterState = {
  interpreters: [],
  status: APIResponseStatus.NotStarted,
  filters: {
    qualificationStatus: QualificationStatus.InEffect,
  },
  qualificationLanguages: [],
};

const getQualificationLanguages = (interpreters: Array<ClerkInterpreter>) => {
  const languages = new Set<string>();
  interpreters.forEach(({ qualifications }) => {
    qualifications.forEach(({ fromLang, toLang }) => {
      languages.add(fromLang);
      languages.add(toLang);
    });
  });

  return Array.from(languages);
};

const clerkInterpreterSlice = createSlice({
  name: 'clerkInterpreter',
  initialState,
  reducers: {
    loadClerkInterpreters(state) {
      state.status = APIResponseStatus.InProgress;
    },
    loadingClerkInterpretersFailed(state) {
      state.status = APIResponseStatus.Error;
    },
    resetClerkInterpreterFilters(state) {
      state.filters = initialState.filters;
    },
    setClerkInterpreterFilters(
      state,
      action: PayloadAction<Partial<ClerkInterpreterFilters>>
    ) {
      state.filters = { ...state.filters, ...action.payload };
    },
    storeClerkInterpreters(
      state,
      action: PayloadAction<Array<ClerkInterpreter>>
    ) {
      state.status = APIResponseStatus.Success;
      state.interpreters = action.payload;
      state.qualificationLanguages = getQualificationLanguages(action.payload);
    },
  },
});

export const clerkInterpreterReducer = clerkInterpreterSlice.reducer;
export const {
  loadClerkInterpreters,
  loadingClerkInterpretersFailed,
  resetClerkInterpreterFilters,
  setClerkInterpreterFilters,
  storeClerkInterpreters,
} = clerkInterpreterSlice.actions;
