import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  EvaluationOrderResponse,
  ExaminationParts,
  PayerDetails,
} from 'interfaces/evaluationOrder';
import { EvaluationPeriod } from 'interfaces/evaluationPeriod';

export interface EvaluationOrderState {
  submitOrderState: APIResponseStatus;
  loadPeriodState: APIResponseStatus;
  evaluationPeriod?: EvaluationPeriod;
  examinationParts: ExaminationParts;
  acceptConditions: boolean;
  payerDetails: PayerDetails;
  showErrors: boolean;
  evaluationPaymentRedirectResponse?: EvaluationOrderResponse;
}

export const initialState: EvaluationOrderState = {
  submitOrderState: APIResponseStatus.NotStarted,
  loadPeriodState: APIResponseStatus.NotStarted,
  examinationParts: {
    readingComprehension: false,
    speechComprehension: false,
    speaking: false,
    writing: false,
  },
  acceptConditions: false,
  payerDetails: {},
  showErrors: false,
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
    acceptEvaluationOrder(
      state,
      action: PayloadAction<EvaluationOrderResponse>
    ) {
      state.submitOrderState = APIResponseStatus.Success;
      state.evaluationPaymentRedirectResponse = action.payload;
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
    setPayerDetails(state, action: PayloadAction<Partial<PayerDetails>>) {
      state.payerDetails = { ...state.payerDetails, ...action.payload };
    },
    setShowErrors(state, action: PayloadAction<boolean>) {
      state.showErrors = action.payload;
    },
    resetEvaluationOrderState(_state) {
      return initialState;
    },
  },
});

export const evaluationOrderReducer = evaluationOrderSlice.reducer;
export const {
  loadEvaluationPeriod,
  storeEvaluationPeriod,
  rejectEvaluationPeriod,
  rejectEvaluationOrder,
  setAcceptConditions,
  setExaminationParts,
  setPayerDetails,
  setShowErrors,
  submitEvaluationOrder,
  resetEvaluationOrderState,
  acceptEvaluationOrder,
} = evaluationOrderSlice.actions;
