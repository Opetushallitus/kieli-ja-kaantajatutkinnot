import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { EvaluationPeriods } from 'interfaces/evaluationPeriod';

interface EvaluationPeriodState extends EvaluationPeriods {
  status: APIResponseStatus;
}

const initialState: EvaluationPeriodState = {
  evaluation_periods: [],
  status: APIResponseStatus.NotStarted,
};

const evaluationPeriodsSlice = createSlice({
  name: 'evaluationPeriod',
  initialState,
  reducers: {
    loadEvaluationPeriods(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectEvaluationPeriods(state) {
      state.status = APIResponseStatus.Error;
    },
    storeEvaluationPeriods(state, action: PayloadAction<EvaluationPeriods>) {
      state.status = APIResponseStatus.Success;
      state.evaluation_periods = action.payload.evaluation_periods;
    },
  },
});

export const evaluationPeriodsReducer = evaluationPeriodsSlice.reducer;
export const {
  loadEvaluationPeriods,
  rejectEvaluationPeriods,
  storeEvaluationPeriods,
} = evaluationPeriodsSlice.actions;
