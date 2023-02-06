import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ExamSessions } from 'interfaces/examSessions';

interface ExamSessionsState extends ExamSessions {
  status: APIResponseStatus;
}

const initialState: ExamSessionsState = {
  exam_sessions: [],
  status: APIResponseStatus.NotStarted,
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
    },
  },
});

export const examSessionsReducer = examSessionsSlice.reducer;
export const { loadExamSessions, rejectExamSessions, storeExamSessions } =
  examSessionsSlice.actions;
