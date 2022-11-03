import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import { ExamEventToggleFilter, ExamLanguage } from 'enums/app';
import { ExamEventUtils } from 'utils/examEvent';

export const clerkExamEventsSelector = (state: RootState) =>
  state.clerkExamEvent;

export const selectFilteredClerkExamEvents = createSelector(
  (state: RootState) => state.clerkExamEvent.examEvents,
  (state: RootState) => state.clerkExamEvent.languageFilter,
  (state: RootState) => state.clerkExamEvent.toggleFilter,
  (examEvents, languageFilter, toggleFilter) => {
    let filteredExamEvents = examEvents;

    if (languageFilter !== ExamLanguage.ALL) {
      filteredExamEvents = filteredExamEvents.filter(
        (e) => e.language === languageFilter
      );
    }

    if (toggleFilter === ExamEventToggleFilter.Upcoming) {
      return ExamEventUtils.getUpcomingExamEvents(filteredExamEvents);
    } else {
      return ExamEventUtils.getPassedExamEvents(filteredExamEvents);
    }
  }
);
