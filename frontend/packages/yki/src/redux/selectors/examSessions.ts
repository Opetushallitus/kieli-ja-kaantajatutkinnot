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
    filteredData = filteredData.filter(
      (es) =>
        ExamSessionUtils.getMunicipality(es.location[0]) ===
        filters.municipality
    );
  }

  if (filters.excludeFullSessions || filters.excludeNonOpenSessions) {
    filteredData = filteredData.filter((es) => {
      const { open, availablePlaces } =
        ExamSessionUtils.getEffectiveRegistrationPeriodDetails(es);
      if (filters.excludeFullSessions && filters.excludeNonOpenSessions) {
        return availablePlaces > 0 && open;
      } else if (filters.excludeFullSessions) {
        return availablePlaces > 0;
      } else {
        return open;
      }
    });
  }

  return filteredData;
};
