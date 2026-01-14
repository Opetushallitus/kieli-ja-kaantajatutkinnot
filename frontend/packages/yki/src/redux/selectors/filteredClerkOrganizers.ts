import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'configs/redux';
import { ClerkOrganizerType } from 'interfaces/clerkOrganizer';
import { getOrganizerAddress } from 'utils/clerk';

export const filteredClerkOrganizersSelector = createSelector(
  [
    (state: RootState) => state.clerkOrganizer.organizerRegistry,
    (state: RootState) => state.clerkOrganizer.searchQuery,
  ],
  (organizerRegistry, searchQuery) => {
    const allRows: ClerkOrganizerType[] = organizerRegistry.map(
      (organizer) => ({
        ...organizer.organizer,
        name: organizer?.organization?.nimi?.fi ?? '',
        address: getOrganizerAddress(organizer.organization),
      }),
    );

    if (!searchQuery) {
      return allRows;
    }

    const query = searchQuery.toLowerCase();

    return allRows.filter(
      (row) =>
        row.name.toLowerCase().includes(query) ||
        row.address.city.toLowerCase().includes(query),
    );
  },
);
