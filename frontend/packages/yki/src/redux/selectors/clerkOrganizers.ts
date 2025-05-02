import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import {
  ClerkOrganizer,
  ClerkOrganizerFilters,
} from 'interfaces/clerkOrganizer';

export const clerkOrganizersSelector = (state: RootState) =>
  state.clerkOrganizer;

export const selectFilteredClerkOrganizers = createSelector(
  (state: RootState) => state.clerkOrganizer.organizers,
  (state: RootState) => state.clerkOrganizer.filters,
  (organizers: ClerkOrganizer[], _filters: ClerkOrganizerFilters) => {
    // TODO: Add filters
    return organizers;
  },
);
