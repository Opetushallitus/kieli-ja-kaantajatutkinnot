import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'configs/redux';
import { ClerkQuarantineMatch } from 'interfaces/clerkQuarantine';

export const clerkQuarantineSelector = (state: RootState) =>
  state.clerkQuarantine;

export const selectSortedQuarantineMatches = createSelector(
  (state: RootState) => state.clerkQuarantine.matches,
  (state: RootState) => state.clerkQuarantine.sort,
  (matches: ClerkQuarantineMatch[], sort) => {
    const [, sortOrder] = sort.split(':');

    return [...matches].sort((a, b) => {
      switch (true) {
        case a.examDate.isBefore(b.examDate):
          return sortOrder === 'asc' ? -1 : 1;
        case b.examDate.isBefore(a.examDate):
          return sortOrder === 'asc' ? 1 : -1;
        default:
          return 0;
      }
    });
  },
);
