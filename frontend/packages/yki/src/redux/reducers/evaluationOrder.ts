import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ExaminationParts } from 'interfaces/evaluationOrder';
import { EvaluationPeriod } from 'interfaces/evaluationPeriod';

interface EvaluationOrderState {
  submitOrderState: APIResponseStatus;
  loadPeriodState: APIResponseStatus;
  evaluationPeriod?: EvaluationPeriod;
  examinationParts: ExaminationParts;
  acceptConditions: boolean;
}

const initialState: EvaluationOrderState = {
  submitOrderState: APIResponseStatus.NotStarted,
  loadPeriodState: APIResponseStatus.NotStarted,
  examinationParts: {
    readingComprehension: false,
    speechComprehension: false,
    speaking: false,
    writing: false,
  },
  acceptConditions: false,
};

const evaluationOrderSlice = createSlice({
  name: 'evaluationOrder',
  initialState,
  reducers: {
    loadEvaluationPeriod(state, _action: PayloadAction<number>) {
      state.loadPeriodState = APIResponseStatus.InProgress;
    },
    storeEvaluationPeriod(state, action: PayloadAction<EvaluationPeriod>) {
      state.loadPeriodState = APIResponseStatus.Success;
      state.evaluationPeriod = action.payload;
    },
    rejectEvaluationPeriod(state) {
      state.loadPeriodState = APIResponseStatus.Error;
    },
    submitEvaluationOrder(state) {
      state.submitOrderState = APIResponseStatus.InProgress;
    },
    rejectEvaluationOrder(state) {
      state.submitOrderState = APIResponseStatus.Error;
    },
    acceptEvaluationOrder(state) {
      state.submitOrderState = APIResponseStatus.Success;
    },
    setExaminationParts(
      state,
      action: PayloadAction<Partial<ExaminationParts>>
    ) {
      state.examinationParts = { ...state.examinationParts, ...action.payload };
    },
    setAcceptConditions(state, action: PayloadAction<boolean>) {
      state.acceptConditions = action.payload;
    },
  },
});

export const evaluationOrderReducer = evaluationOrderSlice.reducer;
export const {
  loadEvaluationPeriod,
  storeEvaluationPeriod,
  rejectEvaluationPeriod,
  submitEvaluationOrder,
  rejectEvaluationOrder,
  acceptEvaluationOrder,
  setAcceptConditions,
  setExaminationParts,
} = evaluationOrderSlice.actions;
