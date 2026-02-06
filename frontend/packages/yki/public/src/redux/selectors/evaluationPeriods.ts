import { RootState } from 'configs/redux';

export const evaluationPeriodsSelector = (state: RootState) =>
  state.evaluationPeriods;
