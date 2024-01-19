import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  EvaluationOrderDetails,
  ExaminationParts,
  ParticipantDetails,
} from 'interfaces/evaluationOrder';
import { EvaluationPeriod } from 'interfaces/evaluationPeriod';

export interface EvaluationOrderState {
  submitOrderState: APIResponseStatus;
  loadPeriodState: APIResponseStatus;
  loadEvaluationOrderDetailsState: APIResponseStatus;
  evaluationPeriod?: EvaluationPeriod;
  evaluationOrderDetails?: EvaluationOrderDetails;
  examinationParts: ExaminationParts;
  acceptConditions: boolean;
  participantDetails: ParticipantDetails;
  showErrors: boolean;
  evaluationPaymentRedirect?: string;
}

export const initialState: EvaluationOrderState = {
  submitOrderState: APIResponseStatus.NotStarted,
  loadPeriodState: APIResponseStatus.NotStarted,
  loadEvaluationOrderDetailsState: APIResponseStatus.NotStarted,
  examinationParts: {
    readingComprehension: false,
    speechComprehension: false,
    speaking: false,
    writing: false,
  },
  acceptConditions: false,
  participantDetails: {},
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
    acceptEvaluationOrder(state, action: PayloadAction<string>) {
      state.submitOrderState = APIResponseStatus.Success;
      state.evaluationPaymentRedirect = action.payload;
    },
    setExaminationParts(
      state,
      action: PayloadAction<Partial<ExaminationParts>>,
    ) {
      state.examinationParts = { ...state.examinationParts, ...action.payload };
    },
    setAcceptConditions(state, action: PayloadAction<boolean>) {
      state.acceptConditions = action.payload;
    },
    setParticipantDetails(
      state,
      action: PayloadAction<Partial<ParticipantDetails>>,
    ) {
      state.participantDetails = {
        ...state.participantDetails,
        ...action.payload,
      };
    },
    setShowErrors(state, action: PayloadAction<boolean>) {
      state.showErrors = action.payload;
    },
    resetEvaluationOrderState(_state) {
      return initialState;
    },
    acceptEvaluationOrderDetails(
      state,
      action: PayloadAction<EvaluationOrderDetails>,
    ) {
      state.loadEvaluationOrderDetailsState = APIResponseStatus.Success;
      state.evaluationOrderDetails = action.payload;
    },
    loadEvaluationOrderDetails(state, _action: PayloadAction<number>) {
      state.loadEvaluationOrderDetailsState = APIResponseStatus.InProgress;
    },
    rejectEvaluationOrderDetails(state) {
      state.loadEvaluationOrderDetailsState = APIResponseStatus.Error;
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
  setParticipantDetails,
  setShowErrors,
  submitEvaluationOrder,
  resetEvaluationOrderState,
  acceptEvaluationOrder,
  acceptEvaluationOrderDetails,
  loadEvaluationOrderDetails,
  rejectEvaluationOrderDetails,
} = evaluationOrderSlice.actions;
