import { RootState } from 'configs/redux';

export const publicEnrollmentSelector = (state: RootState) =>
  state.publicEnrollment;
