import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'configs/redux';
import { ExamEventToggleFilter, ExamLanguage } from 'enums/app';
import {
  ClerkExaminerExamEventListingEntry,
  ClerkListExaminerExamEventFilters,
  ClerkListExaminerFilters,
  ClerkListExaminerState,
} from 'interfaces/clerkListExaminer';
import { ExaminerDetails } from 'interfaces/examinerDetails';
import { ExamEventUtils } from 'utils/examEvent';

export const clerkListExaminerSelector = (
  state: RootState,
): ClerkListExaminerState => state.clerkListExaminer;

export const selectFilteredExaminers = createSelector(
  (state: RootState) => state.clerkListExaminer.examiners,
  (state: RootState) => state.clerkListExaminer.filters.examiners,
  (
    examiners: Array<ExaminerDetails>,
    filters: ClerkListExaminerFilters,
  ): Array<ExaminerDetails> => {
    const { examLanguage } = filters;

    if (examLanguage === ExamLanguage.FI) {
      return examiners.filter((e) => e.examLanguageFinnish);
    } else if (examLanguage === ExamLanguage.SV) {
      return examiners.filter((e) => e.examLanguageSwedish);
    } else {
      return examiners;
    }
  },
);

export const selectFilteredClerkExaminerExamEvents = createSelector(
  (state: RootState) => state.clerkListExaminer.examiners,
  (state: RootState) => state.clerkListExaminer.filters.examEvents,
  (
    examiners: Array<ExaminerDetails>,
    filters: ClerkListExaminerExamEventFilters,
  ): Array<ClerkExaminerExamEventListingEntry> => {
    let results: Array<ClerkExaminerExamEventListingEntry> = examiners
      .flatMap((examiner) => {
        const {
          examEvents,
          contactRequests: _contactRequests,
          ...rest
        } = examiner;

        return examEvents.map((examEvent) => ({
          examEvent,
          examiner: rest,
        }));
      })
      .map((v, i) => ({ ...v, id: i }));

    if (filters.examLanguage !== ExamLanguage.ALL) {
      results = results.filter(
        ({ examEvent }) => examEvent.language === filters.examLanguage,
      );
    }

    if (filters.toggleFilters === ExamEventToggleFilter.Upcoming) {
      return ExamEventUtils.getUpcomingClerkExaminerExamEventEntries(results);
    } else {
      return ExamEventUtils.getPassedClerkExaminerExamEventEntries(results);
    }
  },
);
