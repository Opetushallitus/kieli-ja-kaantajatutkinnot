import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';

export const clerkOrganizersSelector = (state: RootState) =>
  state.clerkOrganizer;

export const selectFilteredClerkOrganizers = createSelector(
  (state: RootState) => state.clerkOrganizer.organizers,
  (state: RootState) => state.clerkOrganizer.filters,
  (organizers, _filters) => {
    // TODO: Add filters
    return organizers;
  },
);
