import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import { ExamDate, ExamDateSort, SortOrder } from 'interfaces/examDate';

export const examDateSelector = (state: RootState) => state.examDate;

export const selectSortedExamDates = createSelector(
  (state: RootState) => state.examDate.examDates,
  (state: RootState) => state.examDate.examDateSort,
  (examDates: ExamDate[], examDateSort: ExamDateSort) => {
    const [sortKey, sortOrder] = examDateSort.split(':') as [
      keyof ExamDate,
      SortOrder,
    ];

    if (sortKey === 'examDate' && sortOrder) {
      return [...examDates].sort((a, b) => {
        const aValue = a.examDate.valueOf();
        const bValue = b.examDate.valueOf();

        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;

        return 0;
      });
    }

    return examDates;
  },
);
