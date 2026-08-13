import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ExamSession } from 'interfaces/examSessions';
import { acceptFetchRegistrationDetails } from 'redux/reducers/registration';

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
    resetExamSession() {
      return initialState;
    },
    storeExamSession(state, action: PayloadAction<ExamSession>) {
      state.status = APIResponseStatus.Success;
      state.examSession = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(acceptFetchRegistrationDetails, (state, action) => {
      if (state.examSession) {
        state.examSession.available_registration_kind = action.payload.kind;
      }
    });
  },
});

export const examSessionReducer = examSessionSlice.reducer;
export const {
  loadExamSession,
  rejectExamSession,
  resetExamSession,
  storeExamSession,
} = examSessionSlice.actions;
