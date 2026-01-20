import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'configs/redux';
import { ClerkOrganizerType } from 'interfaces/clerkOrganizer';
import { getOrganizerAddress } from 'utils/clerk';

export const filteredClerkOrganizersSelector = createSelector(
  [
    (state: RootState) => state.clerkOrganizer.organizerRegistry,
    (state: RootState) => state.clerkOrganizer.searchQuery,
    (state: RootState) => state.clerkOrganizer.languageFilter,
    (state: RootState) => state.clerkOrganizer.levelFilter,
  ],
  (organizerRegistry, searchQuery, languageFilter, levelFilter) => {
    const allRows: ClerkOrganizerType[] = organizerRegistry.map(
      (organizer) => ({
        ...organizer.organizer,
        name: organizer?.organization?.nimi?.fi ?? '',
        address: getOrganizerAddress(organizer.organization),
      }),
    );

    return allRows.filter((row) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          row.name.toLowerCase().includes(query) ||
          row.address.city.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (languageFilter || levelFilter) {
        if (!row.languages || row.languages.length === 0) {
          return false;
        }

        const hasMatch = row.languages.some((lang) => {
          const matchesLanguage = languageFilter
            ? lang.language_code === languageFilter
            : true;
          const matchesLevel = levelFilter
            ? lang.level_code === levelFilter
            : true;

          return matchesLanguage && matchesLevel;
        });
        if (!hasMatch) return false;
      }

      return true;
    });
  },
);
