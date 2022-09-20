import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { QualificationStatus } from 'enums/clerkInterpreter';
import {
  ClerkInterpreter,
  ClerkInterpreterFilters,
} from 'interfaces/clerkInterpreter';
import { QualificationUtils } from 'utils/qualifications';

interface ClerkInterpreterState {
  interpreters: Array<ClerkInterpreter>;
  status: APIResponseStatus;
  filters: ClerkInterpreterFilters;
  distinctToLangs: Array<string>;
}

const initialState: ClerkInterpreterState = {
  interpreters: [],
  status: APIResponseStatus.NotStarted,
  filters: {
    qualificationStatus: QualificationStatus.Effective,
    fromLang: 'FI',
  },
  distinctToLangs: [],
};

const getDistinctToLangs = (interpreters: Array<ClerkInterpreter>) => {
  const languages = new Set<string>();

  interpreters.forEach(({ qualifications }) => {
    const distinctQualifications =
      QualificationUtils.getQualificationsVisibleInClerkHomePage(
        qualifications
      );

    distinctQualifications.forEach(({ toLang }) => {
      languages.add(toLang);
    });
  });

  return Array.from(languages);
};

const clerkInterpreterSlice = createSlice({
  name: 'clerkInterpreter',
  initialState,
  reducers: {
    addClerkInterpreterFilter(
      state,
      action: PayloadAction<Partial<ClerkInterpreterFilters>>
    ) {
      state.filters = { ...state.filters, ...action.payload };
    },
    loadClerkInterpreters(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectClerkInterpreters(state) {
      state.status = APIResponseStatus.Error;
    },
    resetClerkInterpreterFilters(state) {
      state.filters = initialState.filters;
    },
    storeClerkInterpreters(
      state,
      action: PayloadAction<Array<ClerkInterpreter>>
    ) {
      state.status = APIResponseStatus.Success;
      state.interpreters = action.payload;
      state.distinctToLangs = getDistinctToLangs(action.payload);
    },
    upsertClerkInterpreter(state, action: PayloadAction<ClerkInterpreter>) {
      const updatedInterpreters = [...state.interpreters];
      const interpreter = action.payload;
      const idx = updatedInterpreters.findIndex(
        (t: ClerkInterpreter) => t.id === interpreter.id
      );
      const spliceIndex = idx >= 0 ? idx : updatedInterpreters.length;

      updatedInterpreters.splice(spliceIndex, 1, interpreter);
      state.interpreters = updatedInterpreters;
    },
  },
});

export const clerkInterpreterReducer = clerkInterpreterSlice.reducer;
export const {
  addClerkInterpreterFilter,
  loadClerkInterpreters,
  rejectClerkInterpreters,
  resetClerkInterpreterFilters,
  storeClerkInterpreters,
  upsertClerkInterpreter,
} = clerkInterpreterSlice.actions;
