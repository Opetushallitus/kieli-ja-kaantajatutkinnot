import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';
import { WithId } from 'shared/interfaces';

import { DraftClerkExamEvent } from 'interfaces/clerkExamEvent';

interface ClerkNewExamDateState extends Partial<WithId> {
  status: APIResponseStatus;
  examDate: DraftClerkExamEvent;
}

const initialState: ClerkNewExamDateState = {
  examDate: {
    language: undefined,
    level: undefined,
    date: undefined,
    registrationCloses: undefined,
    maxParticipants: undefined,
    isHidden: false,
  },
  status: APIResponseStatus.NotStarted,
  id: undefined,
};

const clerkNewExamDateSlice = createSlice({
  name: 'clerkNewExamDate',
  initialState,
  reducers: {
    rejectClerkNewExamDate(state) {
      state.status = APIResponseStatus.Error;
    },
    resetClerkNewExamDate(state) {
      state.status = APIResponseStatus.NotStarted;
      state.examDate = initialState.examDate;
      state.id = undefined;
    },
    successClerkNewExamDate(state) {
      state.status = APIResponseStatus.Success;
    },
    saveClerkNewExamDate(state, _action: PayloadAction<DraftClerkExamEvent>) {
      state.status = APIResponseStatus.InProgress;
    },
    updateClerkNewExamDate(state, action: PayloadAction<DraftClerkExamEvent>) {
      state.examDate = action.payload;
    },
  },
});

export const clerkNewExamDateReducer = clerkNewExamDateSlice.reducer;
export const {
  rejectClerkNewExamDate,
  resetClerkNewExamDate,
  saveClerkNewExamDate,
  successClerkNewExamDate,
  updateClerkNewExamDate,
} = clerkNewExamDateSlice.actions;
