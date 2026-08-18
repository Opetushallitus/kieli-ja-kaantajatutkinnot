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
        const { availablePlaces: availablePlacesRead } =
          ExamSessionUtils.getEffectiveRegistrationPeriodDetails(es, 'READ');
        const { availablePlaces: availablePlacesSpeak } =
          ExamSessionUtils.getEffectiveRegistrationPeriodDetails(es, 'SPEAK');
        if (filters.excludeFullSessions && filters.excludeNonOpenSessions) {
          return (availablePlacesRead > 0 || availablePlacesSpeak > 0) && open;
        } else if (filters.excludeFullSessions) {
          return availablePlacesRead > 0 || availablePlacesSpeak > 0;
        } else {
          return open;
        }
      }

      if (es.type === 'LISTEN_WRITE') {
        const { open } =
          ExamSessionUtils.getEffectiveRegistrationPeriodDetails(es);
        const { availablePlaces: availablePlacesListen } =
          ExamSessionUtils.getEffectiveRegistrationPeriodDetails(es, 'LISTEN');
        const { availablePlaces: availablePlacesWrite } =
          ExamSessionUtils.getEffectiveRegistrationPeriodDetails(es, 'WRITE');
        if (filters.excludeFullSessions && filters.excludeNonOpenSessions) {
          return (
            (availablePlacesListen > 0 || availablePlacesWrite > 0) && open
          );
        } else if (filters.excludeFullSessions) {
          return availablePlacesListen > 0 || availablePlacesWrite > 0;
        } else {
          return open;
        }
      }

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
