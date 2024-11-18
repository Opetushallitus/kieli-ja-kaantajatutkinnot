import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'configs/redux';
import { ExamLanguage } from 'enums/app';
import {
  ClerkListExaminerFilters,
  ClerkListExaminerState,
} from 'interfaces/clerkListExaminer';
import { ExaminerDetails } from 'interfaces/examinerDetails';

export const clerkListExaminerSelector = (
  state: RootState,
): ClerkListExaminerState => state.clerkListExaminer;

export const selectFilteredExaminers = createSelector(
  (state: RootState) => state.clerkListExaminer.examiners,
  (state: RootState) => state.clerkListExaminer.filters,
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
