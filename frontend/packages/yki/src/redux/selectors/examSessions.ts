import dayjs, { Dayjs } from 'dayjs';
import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import { ExamLanguage, ExamLevel } from 'enums/app';
import { ExamSession, ExamSessionFilters } from 'interfaces/examSessions';

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

  if (filters.excludeFullSessions) {
    filteredData = filteredData.filter(
      (es) =>
        es.participants < es.max_participants ||
        (es.post_admission_active &&
          es.pa_participants < es.post_admission_quota)
    );
  }

  if (filters.excludeNonOpenSessions) {
    const now = dayjs();
    filteredData = filteredData.filter(
      (es) => isRegistrationOpen(es, now) || isPostAdmissionOpen(es, now)
    );
  }

  return filteredData;
};

const isRegistrationOpen = (es: ExamSession, now: Dayjs) => {
  const start = es.registration_start_date as Dayjs;
  const end = es.registration_end_date as Dayjs;

  return now.isAfter(start.hour(10)) && now.isBefore(end.hour(16));
};

const isPostAdmissionOpen = (es: ExamSession, now: Dayjs) => {
  if (!es.post_admission_active) {
    return false;
  }

  const start = es.post_admission_start_date as Dayjs;
  const end = es.post_admission_end_date as Dayjs;

  return now.isAfter(start.hour(10)) && now.isBefore(end.hour(16));
};
