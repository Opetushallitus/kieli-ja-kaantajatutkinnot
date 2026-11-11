import { RootState } from 'configs/redux';

export const publicIdentificationSelector = (state: RootState) =>
  state.registrationV2.publicIdentification;
