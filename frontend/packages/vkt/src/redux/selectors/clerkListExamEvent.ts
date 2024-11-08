import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import { ExamEventToggleFilter, ExamLanguage } from 'enums/app';
import { ClerkListExamEvent } from 'interfaces/clerkListExamEvent';
import { ExamEventUtils } from 'utils/examEvent';

export const clerkListExamEventsSelector = (state: RootState) =>
  state.clerkListExamEvent;

export const selectFilteredClerkExamEvents = createSelector(
  (state: RootState) => state.clerkListExamEvent.examEvents,
  (state: RootState) => state.clerkListExamEvent.languageFilter,
  (state: RootState) => state.clerkListExamEvent.toggleFilter,
  (examEvents, languageFilter, toggleFilter): Array<ClerkListExamEvent> => {
    let filteredExamEvents = examEvents;

    if (languageFilter !== ExamLanguage.ALL) {
      filteredExamEvents = filteredExamEvents.filter(
        (e: ClerkListExamEvent) => e.language === languageFilter,
      );
    }

    if (toggleFilter === ExamEventToggleFilter.Upcoming) {
      return ExamEventUtils.getUpcomingExamEvents(filteredExamEvents) as Array<ClerkListExamEvent>;
    } else {
      return ExamEventUtils.getPassedExamEvents(filteredExamEvents) as Array<ClerkListExamEvent>;
    }
  },
);
