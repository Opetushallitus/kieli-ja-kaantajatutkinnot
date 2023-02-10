import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ExamLanguage } from 'enums/app';
import { ExamSessionFilters, ExamSessions } from 'interfaces/examSessions';

interface ExamSessionsState extends ExamSessions {
  status: APIResponseStatus;
  filters: ExamSessionFilters;
  municipalities: Array<string>;
}

const initialState: ExamSessionsState = {
  exam_sessions: [],
  municipalities: [],
  status: APIResponseStatus.NotStarted,
  filters: {
    // TODO FIN or undefined?
    language: ExamLanguage.FIN,
    level: undefined,
    municipality: undefined,
    excludeFullSessions: false,
    excludeNonOpenSessions: false,
  },
};

const examSessionsSlice = createSlice({
  name: 'examSessions',
  initialState,
  reducers: {
    loadExamSessions(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectExamSessions(state) {
      state.status = APIResponseStatus.Error;
    },
    storeExamSessions(state, action: PayloadAction<ExamSessions>) {
      state.status = APIResponseStatus.Success;
      state.exam_sessions = action.payload.exam_sessions;
      const uniqueMunicipalities = new Set(
        action.payload.exam_sessions.map((es) => es.location[0].post_office)
      );
      state.municipalities = Array.from(uniqueMunicipalities);
    },
    setPublicExamSessionFilters(
      state,
      action: PayloadAction<Partial<ExamSessionFilters>>
    ) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetPublicExamSessionFilters(state) {
      state.filters = initialState.filters;
    },
  },
});

export const examSessionsReducer = examSessionsSlice.reducer;
export const {
  loadExamSessions,
  rejectExamSessions,
  storeExamSessions,
  setPublicExamSessionFilters,
  resetPublicExamSessionFilters,
} = examSessionsSlice.actions;
