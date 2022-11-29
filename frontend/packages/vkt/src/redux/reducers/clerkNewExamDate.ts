import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';
import { WithId } from 'shared/interfaces';

import { ClerkExamEvent } from 'interfaces/clerkExamEvent';

interface ClerkNewExamDateState extends Partial<WithId> {
  status: APIResponseStatus;
  examDate?: ClerkExamEvent;
}

const initialState: ClerkNewExamDateState = {
  examDate: undefined,
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
    saveClerkNewExamDate(state, _action: PayloadAction<ClerkExamEvent>) {
      state.status = APIResponseStatus.InProgress;
    },
    storeClerkNewExamDate(state, action: PayloadAction<number>) {
      state.status = APIResponseStatus.Success;
      state.id = action.payload;
    },
    updateClerkNewExamDate(state, action: PayloadAction<ClerkExamEvent>) {
      state.examDate = action.payload;
    },
  },
});

export const clerkNewExamDateReducer = clerkNewExamDateSlice.reducer;
export const {
  rejectClerkNewExamDate,
  resetClerkNewExamDate,
  saveClerkNewExamDate,
  storeClerkNewExamDate,
  updateClerkNewExamDate,
} = clerkNewExamDateSlice.actions;
