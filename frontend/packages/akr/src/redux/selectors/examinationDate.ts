import dayjs, { Dayjs } from 'dayjs';
import { createSelector } from 'reselect';
import { DateUtils } from 'shared/utils';

import { RootState } from 'configs/redux';
import { ExaminationDateStatus } from 'enums/examinationDate';

export const examinationDatesSelector = (state: RootState) =>
  state.examinationDate;

export const selectExaminationDatesByStatus = createSelector(
  (state: RootState) => state.examinationDate.examinationDates,
  (examinationDates) => {
    const now = dayjs();
    const upcoming = examinationDates.dates
      .filter(({ date }) =>
        selectExaminationDateByStatus(
          date,
          ExaminationDateStatus.Upcoming,
          now,
        ),
      )
      .sort((a, b) => a.date.valueOf() - b.date.valueOf());

    const passed = examinationDates.dates
      .filter(({ date }) =>
        selectExaminationDateByStatus(date, ExaminationDateStatus.Passed, now),
      )
      .sort((a, b) => b.date.valueOf() - a.date.valueOf());

    return {
      upcoming,
      passed,
    };
  },
);

const selectExaminationDateByStatus = (
  date: Dayjs,
  status: ExaminationDateStatus,
  currentDate: Dayjs,
) => {
  const isBefore = DateUtils.isDatePartBefore(date, currentDate);

  return status === ExaminationDateStatus.Upcoming ? !isBefore : isBefore;
};
