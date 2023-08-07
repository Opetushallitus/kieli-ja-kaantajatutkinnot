import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ExamSessionFilters, ExamSessions } from 'interfaces/examSessions';
import { ExamSessionUtils } from 'utils/examSession';

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
    language: undefined,
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
      const examSessions = action.payload.exam_sessions.sort((es1, es2) =>
        ExamSessionUtils.compareExamSessions(es1, es2)
      );
      const uniqueMunicipalities = new Set(
        examSessions.map((es) => es.location[0].post_office)
      );

      state.status = APIResponseStatus.Success;
      state.exam_sessions = examSessions;
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
