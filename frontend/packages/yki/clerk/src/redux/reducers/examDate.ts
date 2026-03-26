import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  CreateExamDateRequest,
  ExamDate,
  ExamDateSort,
  UpdateExamDateRequest,
} from 'interfaces/examDate';

interface ExamDateState {
  status: APIResponseStatus;
  addStatus: APIResponseStatus;
  updateStatus: APIResponseStatus;
  examDates: ExamDate[];
  examDateSort: ExamDateSort;
}

const initialState: ExamDateState = {
  status: APIResponseStatus.NotStarted,
  addStatus: APIResponseStatus.NotStarted,
  updateStatus: APIResponseStatus.NotStarted,
  examDates: [],
  examDateSort: 'examDate:desc',
};

const examDateSlice = createSlice({
  name: 'examDate',
  initialState,
  reducers: {
    loadExamDates(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectExamDates(state) {
      state.status = APIResponseStatus.Error;
    },
    storeExamDates(state, action: PayloadAction<ExamDate[]>) {
      state.status = APIResponseStatus.Success;
      state.examDates = action.payload;
    },
    addExamDate(state, _action: PayloadAction<CreateExamDateRequest>) {
      state.addStatus = APIResponseStatus.InProgress;
    },
    rejectAddExamDate(state) {
      state.addStatus = APIResponseStatus.Error;
    },
    storeAddExamDate(state) {
      state.addStatus = APIResponseStatus.Success;
    },
    resetAddExamDateStatus(state) {
      state.addStatus = APIResponseStatus.NotStarted;
    },
    updateExamDate(state, _action: PayloadAction<UpdateExamDateRequest>) {
      state.updateStatus = APIResponseStatus.InProgress;
    },
    rejectUpdateExamDate(state) {
      state.updateStatus = APIResponseStatus.Error;
    },
    storeUpdateExamDate(state) {
      state.updateStatus = APIResponseStatus.Success;
    },
    resetUpdateExamDateStatus(state) {
      state.updateStatus = APIResponseStatus.NotStarted;
    },
    setExamDateSort(state, action: PayloadAction<ExamDateSort>) {
      state.examDateSort = action.payload;
    },
  },
});

export const examDateReducer = examDateSlice.reducer;
export const {
  loadExamDates,
  rejectExamDates,
  storeExamDates,
  addExamDate,
  rejectAddExamDate,
  storeAddExamDate,
  resetAddExamDateStatus,
  updateExamDate,
  rejectUpdateExamDate,
  storeUpdateExamDate,
  resetUpdateExamDateStatus,
  setExamDateSort,
} = examDateSlice.actions;
