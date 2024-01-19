import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import { ExamLanguage } from 'enums/app';
import { PublicExamEvent } from 'interfaces/publicExamEvent';

export const publicExamEventsSelector = (state: RootState) =>
  state.publicExamEvent;

export const selectFilteredPublicExamEvents = createSelector(
  (state: RootState) => state.publicExamEvent.examEvents,
  (state: RootState) => state.publicExamEvent.languageFilter,
  (publicExamEvents, languageFilter) => {
    if (languageFilter === ExamLanguage.ALL) {
      return publicExamEvents;
    }

    return publicExamEvents.filter(
      (e: PublicExamEvent) => e.language === languageFilter,
    );
  },
);
