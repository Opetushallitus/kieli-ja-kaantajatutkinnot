import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import { ClerkFreeRegistration } from 'interfaces/clerkFreeRegistration';
import { FreeRegistrationSort } from 'redux/reducers/clerkFreeRegistration';

export const clerkFreeRegistrationSelector = (state: RootState) =>
  state.clerkFreeEnrollmment;

export const selectFilteredFreeRegistrations = createSelector(
  (state: RootState) => state.clerkFreeEnrollmment.freeRegistrations,
  (state: RootState) => state.clerkFreeEnrollmment.sort,
  (freeRegistrations: ClerkFreeRegistration[], _sort: FreeRegistrationSort) => {
    // TODO: Implement sorting
    return freeRegistrations;
  },
);
