import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { ExamSession } from 'interfaces/examSessions';

interface ExamSessionState {
  status: APIResponseStatus;
  activeStep: PublicRegistrationFormStep;
  examSession?: ExamSession;
}

const initialState: ExamSessionState = {
  status: APIResponseStatus.NotStarted,
  activeStep: PublicRegistrationFormStep.Identify,
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
    increaseActiveStep(state) {
      state.activeStep = ++state.activeStep;
    },
    setActiveStep(state, action: PayloadAction<PublicRegistrationFormStep>) {
      state.activeStep = action.payload;
    },
  },
});

export const examSessionReducer = examSessionSlice.reducer;
export const {
  loadExamSession,
  rejectExamSession,
  storeExamSession,
  setActiveStep,
  increaseActiveStep,
} = examSessionSlice.actions;
