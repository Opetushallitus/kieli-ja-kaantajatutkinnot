import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import { ClerkFreeRegistration } from 'interfaces/clerkFreeRegistration';

export const clerkFreeRegistrationSelector = (state: RootState) =>
  state.clerkFreeRegistration;

export const selectFilteredFreeRegistrations = createSelector(
  (state: RootState) => state.clerkFreeRegistration.freeRegistrations,
  (freeRegistrations: ClerkFreeRegistration[]) => {
    // Default sort exam date laskeva
    return [...freeRegistrations].sort((a, b) => {
      const aValue = a['examDate']?.valueOf();
      const bValue = b['examDate']?.valueOf();

      switch (true) {
        case aValue > bValue:
          return 1;
        case aValue < bValue:
          return -1;
        default:
          return 0;
      }
    });
  },
);

export const freeRegistrationApprovalStatusSelector = (state: RootState) =>
  state.clerkFreeRegistration.registrationApprovalStatus;
