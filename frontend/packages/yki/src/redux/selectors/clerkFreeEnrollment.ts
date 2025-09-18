import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import {
  ClerkFreeEnrollment,
  ClerkFreeEnrollmentFilters,
} from 'interfaces/clerkFreeEnrollment';

export const clerkFreeEnrollmentSelector = (state: RootState) =>
  state.clerkFreeEnrollmment;

export const selectFilteredFreeEnrollments = createSelector(
  (state: RootState) => state.clerkFreeEnrollmment.freeEnrollments,
  (state: RootState) => state.clerkFreeEnrollmment.filters,
  (
    freeEnrollments: ClerkFreeEnrollment[],
    _filters: ClerkFreeEnrollmentFilters,
  ) => {
    // TODO: Add filters
    return freeEnrollments;
  },
);
