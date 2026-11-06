import { RootState } from 'configs/redux';

export const examSessionSelector = (state: RootState) =>
  state.registrationV2.examSession;
