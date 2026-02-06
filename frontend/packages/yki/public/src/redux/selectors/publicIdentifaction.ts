import { RootState } from 'configs/redux';

export const publicIdentificationSelector = (state: RootState) =>
  state.publicIdentification;
