import { Dayjs } from 'dayjs';
import { createSelector } from 'reselect';
import { DateUtils } from 'shared/utils';

import { RootState } from 'configs/redux';
import { MeetingStatus } from 'enums/meetingDate';
import { getDayjs } from 'utils/dayjs';

export const meetingDatesSelector = (state: RootState) => state.meetingDate;

export const selectMeetingDatesByMeetingStatus = createSelector(
  (state: RootState) => state.meetingDate.meetingDates,
  (meetingDates) => {
    // TODO Note that this has an *implicit* dependency on the current system time,
    // which we currently fail to take into account properly - the selectors should
    // somehow make the dependency on time explicit!
    const dayjs = getDayjs();
    const now = dayjs();
    const upcoming = meetingDates.meetingDates
      .filter(({ date }) =>
        filterMeetingDateByStatus(date, MeetingStatus.Upcoming, now)
      )
      .sort((a, b) => a.date.valueOf() - b.date.valueOf());

    const passed = meetingDates.meetingDates
      .filter(({ date }) =>
        filterMeetingDateByStatus(date, MeetingStatus.Passed, now)
      )
      .sort((a, b) => b.date.valueOf() - a.date.valueOf());

    return {
      upcoming,
      passed,
    };
  }
);

const filterMeetingDateByStatus = (
  date: Dayjs,
  status: MeetingStatus,
  currentDate: Dayjs
) => {
  const isBefore = DateUtils.isDatePartBefore(date, currentDate);

  return status === MeetingStatus.Upcoming ? !isBefore : isBefore;
};
