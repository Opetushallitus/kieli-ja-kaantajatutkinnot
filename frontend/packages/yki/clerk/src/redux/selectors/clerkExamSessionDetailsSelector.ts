import { RootState } from 'configs/redux';

export const clerkExamSessionDetailsSelector = (state: RootState) =>
  state.clerkExamSession;

export const clerkExamSessionEditFormSelector = (state: RootState) =>
  state.clerkExamSession.editForm;
