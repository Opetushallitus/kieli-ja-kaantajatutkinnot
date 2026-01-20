import { RootState } from 'configs/redux';

export const clerkOrganizersSelector = (state: RootState) =>
  state.clerkOrganizer;
