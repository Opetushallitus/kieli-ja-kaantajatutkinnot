import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import { ExamLanguage, ExamLevel } from 'enums/app';
import {
  ExamSession,
  ExamSessionFilters,
  ExamSessionType,
} from 'interfaces/examSessions';
import { ExamSessionUtils } from 'utils/examSession';

export const examSessionsSelector = (state: RootState) => state.examSessions;

export const selectFilteredPublicExamSessions = createSelector(
  (state: RootState) => state.examSessions.exam_sessions,
  (state: RootState) => state.examSessions.filters,
  (examSessions, filters) => filterExamSessions(examSessions, filters),
);

// Helpers
const filterExamSessions = (
  examSessions: Array<ExamSession>,
  filters: ExamSessionFilters,
) => {
  let filteredData = examSessions;
  // Filter data only if the criteria are defined
  if (filters.language && filters.language !== ExamLanguage.ALL) {
    filteredData = filteredData.filter(
      (es) => es.language_code === filters.language,
    );
  }

  if (filters.level && filters.level !== ExamLevel.ALL) {
    filteredData = filteredData.filter((es) => es.level_code === filters.level);
  }

  if (filters.municipality) {
    filteredData = filteredData.filter(
      (es) =>
        ExamSessionUtils.getMunicipality(es.location[0]) ===
        filters.municipality,
    );
  }

  if (filters.excludeFullSessions || filters.excludeNonOpenSessions) {
    filteredData = filteredData.filter((es) => {
      if (es.type === 'READ_SPEAK') {
        const { open } =
          ExamSessionUtils.getEffectiveRegistrationPeriodDetails(es);
        if (filters.excludeFullSessions && filters.excludeNonOpenSessions) {
          return (
            (es.partial_registration_kind.READ === 'ADMISSION' ||
              es.partial_registration_kind.SPEAK === 'ADMISSION') &&
            open
          );
        } else if (filters.excludeFullSessions) {
          return (
            es.partial_registration_kind.READ === 'ADMISSION' ||
            es.partial_registration_kind.SPEAK === 'ADMISSION'
          );
        } else {
          return open;
        }
      }

      if (es.type === 'LISTEN_WRITE') {
        const { open } =
          ExamSessionUtils.getEffectiveRegistrationPeriodDetails(es);
        if (filters.excludeFullSessions && filters.excludeNonOpenSessions) {
          return (
            (es.partial_registration_kind.LISTEN === 'ADMISSION' ||
              es.partial_registration_kind.WRITE === 'ADMISSION') &&
            open
          );
        } else if (filters.excludeFullSessions) {
          return (
            es.partial_registration_kind.LISTEN === 'ADMISSION' ||
            es.partial_registration_kind.WRITE === 'ADMISSION'
          );
        } else {
          return open;
        }
      }

      const { open } =
        ExamSessionUtils.getEffectiveRegistrationPeriodDetails(es);
      if (filters.excludeFullSessions && filters.excludeNonOpenSessions) {
        return es.available_registration_kind === 'ADMISSION' && open;
      } else if (filters.excludeFullSessions) {
        return es.available_registration_kind === 'ADMISSION';
      } else {
        return open;
      }
    });
  }

  if (filters.selectedPartialExamTypes.length > 0) {
    const allowedTypes = new Set<ExamSessionType>();
    allowedTypes.add('FULL');
    if (
      filters.selectedPartialExamTypes.includes('READ') ||
      filters.selectedPartialExamTypes.includes('SPEAK')
    )
      allowedTypes.add('READ_SPEAK');
    if (
      filters.selectedPartialExamTypes.includes('LISTEN') ||
      filters.selectedPartialExamTypes.includes('WRITE')
    )
      allowedTypes.add('LISTEN_WRITE');
    filteredData = filteredData.filter((es) => allowedTypes.has(es.type));
  }

  return filteredData;
};
