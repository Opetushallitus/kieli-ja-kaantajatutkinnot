import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ExaminerDetailsUpsert,
  ExaminerDetailsUpsertState,
} from 'interfaces/examinerDetailsUpsert';

const initialState: ExaminerDetailsUpsertState = {
  status: APIResponseStatus.NotStarted,
  examinerDetails: {
    isPublic: true,
    examLanguageFinnish: false,
    examLanguageSwedish: false,
    municipalities: [],
  },
};

const examinerDetailsUpsertSlice = createSlice({
  name: 'examinerDetailsUpsert',
  initialState,
  reducers: {
    acceptExaminerDetailsUpsert(state) {
      state.status = APIResponseStatus.Success;
    },
    rejectExaminerDetailsUpsert(state) {
      state.status = APIResponseStatus.Error;
    },
    resetExaminerDetailsUpsert(_) {
      return initialState;
    },
    startExaminerDetailsUpsert(state) {
      state.status = APIResponseStatus.InProgress;
    },
    updateExaminerDetailsUpsert(
      state,
      action: PayloadAction<Partial<ExaminerDetailsUpsert>>,
    ) {
      state.examinerDetails = { ...state.examinerDetails, ...action.payload };
    },
  },
});

export const {
  acceptExaminerDetailsUpsert,
  rejectExaminerDetailsUpsert,
  resetExaminerDetailsUpsert,
  startExaminerDetailsUpsert,
  updateExaminerDetailsUpsert,
} = examinerDetailsUpsertSlice.actions;
export const examinerDetailsUpsertReducer = examinerDetailsUpsertSlice.reducer;
