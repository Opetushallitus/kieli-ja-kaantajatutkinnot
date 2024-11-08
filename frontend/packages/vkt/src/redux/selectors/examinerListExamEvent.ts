import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import { ExamEventToggleFilter, ExamLanguage } from 'enums/app';
import { ExaminerDetails } from 'interfaces/examinerDetails';
import { ExaminerExamEvent } from 'interfaces/examinerExamEvent';
import { ExamEventUtils } from 'utils/examEvent';

export const examinerListExamEventsSelector = (state: RootState) =>
  state.clerkListExamEvent;

export const selectFilteredExaminerExamEvents = createSelector(
  (state: RootState) => state.examinerDetails.examEventFilters.languageFilter,
  (state: RootState) => state.examinerDetails.examEventFilters.toggleFilter,
  (state: RootState) => state.examinerDetails.examiner,
  (
    languageFilter: ExamLanguage,
    toggleFilter: ExamEventToggleFilter,
    examiner?: ExaminerDetails,
  ): Array<ExaminerExamEvent> => {
    const examEvents = examiner?.examEvents || [];
    let filteredExamEvents = examEvents;

    if (languageFilter !== ExamLanguage.ALL) {
      filteredExamEvents = filteredExamEvents.filter(
        (e: ExaminerExamEvent) => e.language === languageFilter,
      );
    }

    if (toggleFilter === ExamEventToggleFilter.Upcoming) {
      return ExamEventUtils.getUpcomingExamEvents(
        filteredExamEvents,
      ) as Array<ExaminerExamEvent>;
    } else {
      return ExamEventUtils.getPassedExamEvents(
        filteredExamEvents,
      ) as Array<ExaminerExamEvent>;
    }
  },
);
