import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import {
  ClerkFreeRegistration,
  ClerkFreeRegistrationSort,
  SortOrder,
} from 'interfaces/clerkFreeRegistration';

export const clerkFreeRegistrationSelector = (state: RootState) =>
  state.clerkFreeRegistration;

export const selectFilteredFreeRegistrations = createSelector(
  (state: RootState) => state.clerkFreeRegistration.freeRegistrations,
  (state: RootState) => state.clerkFreeRegistration.freeRegistrationsSort,
  (
    freeRegistrations: ClerkFreeRegistration[],
    freeRegistrationsSort: ClerkFreeRegistrationSort,
  ) => {
    const [sortKey, sortOrder] = freeRegistrationsSort.split(':') as [
      keyof ClerkFreeRegistration,
      SortOrder,
    ];

    if (sortKey && sortOrder) {
      switch (sortKey) {
        case 'person':
          return [...freeRegistrations].sort((a, b) => {
            const aValue = a.person.lastName.trim();
            const bValue = b.person.lastName.trim();

            switch (true) {
              case aValue.localeCompare(bValue) > 0:
                return sortOrder === 'asc' ? 1 : -1;
              case aValue.localeCompare(bValue) < 0:
                return sortOrder === 'asc' ? -1 : 1;
              default:
                return 0;
            }
          });
        case 'status':
          return [...freeRegistrations].sort((a, b) => {
            const aValue = a['status'];
            const bValue = b['status'];

            switch (true) {
              case aValue.localeCompare(bValue) > 0:
                return sortOrder === 'asc' ? 1 : -1;
              case aValue.localeCompare(bValue) < 0:
                return sortOrder === 'asc' ? -1 : 1;
              default:
                return 0;
            }
          });
        case 'supplementRequestDueDate':
          return [...freeRegistrations].sort((a, b) => {
            const aValue = a[sortKey]?.valueOf() || '';
            const bValue = b[sortKey]?.valueOf() || '';

            switch (true) {
              case aValue === '':
                // Järjestetään tyhjät arvot aina loppuun
                return 1;
              case bValue === '':
                // Järjestetään tyhjät arvot aina loppuun
                return -1;
              case aValue > bValue:
                return sortOrder === 'asc' ? 1 : -1;
              case aValue < bValue:
                return sortOrder === 'asc' ? -1 : 1;
              default:
                return 0;
            }
          });
        case 'assessmentDate':
          return [...freeRegistrations].sort((a, b) => {
            const aValue = a['assessmentDate']?.valueOf() ?? '';
            const bValue = b['assessmentDate']?.valueOf() ?? '';

            switch (true) {
              case aValue === '':
                // Järjestetään tyhjät arvot aina loppuun
                return 1;
              case bValue === '':
                // Järjestetään tyhjät arvot aina loppuun
                return -1;
              case aValue > bValue:
                return sortOrder === 'asc' ? 1 : -1;
              case aValue < bValue:
                return sortOrder === 'asc' ? -1 : 1;
              default:
                return 0;
            }
          });
        case 'examDate':
          return [...freeRegistrations].sort((a, b) => {
            const aValue = a['examDate']?.valueOf();
            const bValue = b['examDate']?.valueOf();

            switch (true) {
              case aValue > bValue:
                return sortOrder === 'asc' ? 1 : -1;
              case aValue < bValue:
                return sortOrder === 'asc' ? -1 : 1;
              default:
                return 0;
            }
          });
        case 'registration':
          return [...freeRegistrations].sort((a, b) => {
            const aValue = a.registration.kind;
            const bValue = b.registration.kind;

            switch (true) {
              case aValue.localeCompare(bValue) > 0:
                return sortOrder === 'asc' ? 1 : -1;
              case aValue.localeCompare(bValue) < 0:
                return sortOrder === 'asc' ? -1 : 1;
              default:
                return 0;
            }
          });
      }
    }

    return freeRegistrations;
  },
);
