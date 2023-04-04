import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ExamSession } from 'interfaces/examSessions';

interface ExamSessionState {
  status: APIResponseStatus;
  examSession?: ExamSession;
}

const initialState: ExamSessionState = {
  status: APIResponseStatus.NotStarted,
};

const examSessionSlice = createSlice({
  name: 'examSession',
  initialState,
  reducers: {
    loadExamSession(state, _action: PayloadAction<number>) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectExamSession(state) {
      state.status = APIResponseStatus.Error;
    },
    storeExamSession(state, action: PayloadAction<ExamSession>) {
      state.status = APIResponseStatus.Success;
      state.examSession = action.payload;
    },
  },
});

export const examSessionReducer = examSessionSlice.reducer;
export const { loadExamSession, rejectExamSession, storeExamSession } =
  examSessionSlice.actions;
