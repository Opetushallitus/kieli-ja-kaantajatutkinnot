import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import { ClerkOrganizer } from 'interfaces/clerkOrganizer';

export const clerkOrganizersSelector = (state: RootState) =>
  state.clerkOrganizer;

export const selectFilteredClerkOrganizers = createSelector(
  (state: RootState) => state.clerkOrganizer.organizers,
  (organizers: ClerkOrganizer[]) => {
    // TODO: Add filters
    return organizers;
  },
);
