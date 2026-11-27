import { RootState } from 'configs/redux';

export const registrationSelector = (state: RootState) =>
  state.registrationV2.registration;
