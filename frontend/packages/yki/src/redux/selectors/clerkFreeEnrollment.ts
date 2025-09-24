import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import { ClerkFreeEnrollment } from 'interfaces/clerkFreeEnrollment';
import { FreeEnrollmentSort } from 'redux/reducers/clerkFreeEnrollment';

export const clerkFreeEnrollmentSelector = (state: RootState) =>
  state.clerkFreeEnrollmment;

export const selectFilteredFreeEnrollments = createSelector(
  (state: RootState) => state.clerkFreeEnrollmment.freeEnrollments,
  (state: RootState) => state.clerkFreeEnrollmment.sort,
  (freeEnrollments: ClerkFreeEnrollment[], _sort: FreeEnrollmentSort) => {
    // TODO: Implement sorting
    return freeEnrollments;
  },
);
