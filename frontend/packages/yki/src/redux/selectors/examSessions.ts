import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import { ExamLanguage, ExamLevel } from 'enums/app';
import { ExamSession, ExamSessionFilters } from 'interfaces/examSessions';
import { ExamSessionUtils } from 'utils/examSession';

export const examSessionsSelector = (state: RootState) => state.examSessions;

export const selectFilteredPublicExamSessions = createSelector(
  (state: RootState) => state.examSessions.exam_sessions,
  (state: RootState) => state.examSessions.filters,
  (examSessions, filters) => filterExamSessions(examSessions, filters)
);

// Helpers
const filterExamSessions = (
  examSessions: Array<ExamSession>,
  filters: ExamSessionFilters
) => {
  let filteredData = examSessions;
  // Filter data only if the criteria are defined
  if (filters.language && filters.language !== ExamLanguage.ALL) {
    filteredData = filteredData.filter(
      (es) => es.language_code === filters.language
    );
  }

  if (filters.level && filters.level !== ExamLevel.ALL) {
    filteredData = filteredData.filter((es) => es.level_code === filters.level);
  }

  if (filters.municipality) {
    // TODO Does reaching to index 0 always work? The post_offices *should* be the same between different locations...
    filteredData = filteredData.filter(
      (es) => es.location[0].post_office === filters.municipality
    );
  }

  if (filters.excludeFullSessions || filters.excludeNonOpenSessions) {
    filteredData = filteredData.filter((es) => {
      const { open, availablePlaces } =
        ExamSessionUtils.getEffectiveRegistrationPeriodDetails(es);
      if (filters.excludeFullSessions && !availablePlaces) {
        return false;
      } else if (filters.excludeNonOpenSessions && !open) {
        return false;
      } else {
        return true;
      }
    });
  }

  return filteredData;
};
