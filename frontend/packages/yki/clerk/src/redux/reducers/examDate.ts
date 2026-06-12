import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  CreateExamDateRequest,
  ExamDate,
  ExamDateSort,
  UpdateEvaluationRequest,
  UpdateExamDateRequest,
} from 'interfaces/examDate';

interface ExamDateState {
  status: APIResponseStatus;
  addStatus: APIResponseStatus;
  updateStatus: APIResponseStatus;
  saveEvaluationStatus: APIResponseStatus;
  deleteStatus: APIResponseStatus;
  examDates: ExamDate[];
  examDateSort: ExamDateSort;
}

const initialState: ExamDateState = {
  status: APIResponseStatus.NotStarted,
  addStatus: APIResponseStatus.NotStarted,
  updateStatus: APIResponseStatus.NotStarted,
  saveEvaluationStatus: APIResponseStatus.NotStarted,
  deleteStatus: APIResponseStatus.NotStarted,
  examDates: [],
  examDateSort: 'examDate:desc',
};

const examDateSlice = createSlice({
  name: 'examDate',
  initialState,
  reducers: {
    loadOrganizerExamDates(state, _action: PayloadAction<string>) {
      state.status = APIResponseStatus.InProgress;
    },
    loadExamDates(state, _action: PayloadAction<boolean>) {
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
    saveEvaluation(
      state,
      _action: PayloadAction<{ examDateId: number } & UpdateEvaluationRequest>,
    ) {
      state.saveEvaluationStatus = APIResponseStatus.InProgress;
    },
    rejectSaveEvaluation(state) {
      state.saveEvaluationStatus = APIResponseStatus.Error;
    },
    storeSaveEvaluation(state) {
      state.saveEvaluationStatus = APIResponseStatus.Success;
    },
    resetSaveEvaluationStatus(state) {
      state.saveEvaluationStatus = APIResponseStatus.NotStarted;
    },
    setExamDateSort(state, action: PayloadAction<ExamDateSort>) {
      state.examDateSort = action.payload;
    },
    deleteExamDate(state, _action: PayloadAction<number>) {
      state.deleteStatus = APIResponseStatus.InProgress;
    },
    rejectDeleteExamDate(state) {
      state.deleteStatus = APIResponseStatus.Error;
    },
    storeDeleteExamDate(state) {
      state.deleteStatus = APIResponseStatus.Success;
    },
    resetDeleteExamDateStatus(state) {
      state.deleteStatus = APIResponseStatus.NotStarted;
    },
  },
});

export const examDateReducer = examDateSlice.reducer;
export const {
  loadOrganizerExamDates,
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
  saveEvaluation,
  rejectSaveEvaluation,
  storeSaveEvaluation,
  resetSaveEvaluationStatus,
  setExamDateSort,
  deleteExamDate,
  rejectDeleteExamDate,
  storeDeleteExamDate,
  resetDeleteExamDateStatus,
} = examDateSlice.actions;
