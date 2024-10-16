import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'configs/redux';
import { ExamLanguage } from 'enums/app';
import { PublicExaminer, PublicExaminerState } from 'interfaces/publicExaminer';

export const publicExaminerSelector: (
  state: RootState,
) => PublicExaminerState = (state: RootState) => state.publicExaminer;

export const selectFilteredPublicExaminers = createSelector(
  (state: RootState) => state.publicExaminer.examiners,
  (state: RootState) => state.publicExaminer.languageFilter,
  (publicExaminers: Array<PublicExaminer>, languageFilter: ExamLanguage) => {
    if (languageFilter === ExamLanguage.ALL) {
      return publicExaminers;
    } else {
      return publicExaminers.filter(
        ({ language }) =>
          language === ExamLanguage.ALL || language === languageFilter,
      );
    }
  },
);
