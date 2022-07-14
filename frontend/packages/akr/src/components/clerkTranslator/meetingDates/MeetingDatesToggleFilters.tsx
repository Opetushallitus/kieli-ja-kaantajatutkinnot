import { ToggleFilterGroup } from 'shared/components';

import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { MeetingStatus } from 'enums/meetingDate';
import { setMeetingDateFilters } from 'redux/actions/meetingDate';
import {
  meetingDatesSelector,
  selectMeetingDatesByMeetingStatus,
} from 'redux/selectors/meetingDate';

export const MeetingDatesToggleFilters = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.meetingDatesToggleFilters',
  });

  const { upcoming, passed } = useAppSelector(
    selectMeetingDatesByMeetingStatus
  );

  const dispatch = useAppDispatch();
  const {
    meetingDates: { filters },
  } = useAppSelector(meetingDatesSelector);

  const filterByDate = (status: MeetingStatus) => {
    dispatch(setMeetingDateFilters({ meetingStatus: status }));
  };

  const toggleFilters = [
    {
      status: MeetingStatus.Upcoming,
      label: t(MeetingStatus.Upcoming),
      count: upcoming.length,
      testId: `meeting-dates-filters__btn--${MeetingStatus.Upcoming}`,
    },
    {
      status: MeetingStatus.Passed,
      label: t(MeetingStatus.Passed),
      count: passed.length,
      testId: `meeting-dates-filters__btn--${MeetingStatus.Passed}`,
    },
  ];

  return (
    <ToggleFilterGroup
      filters={toggleFilters}
      activeStatus={filters.meetingStatus}
      onButtonClick={filterByDate}
    />
  );
};
