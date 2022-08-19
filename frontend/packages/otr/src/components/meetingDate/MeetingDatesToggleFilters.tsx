import { ToggleFilterGroup } from 'shared/components';

import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { MeetingDateStatus } from 'enums/meetingDate';
import { setMeetingDateFilters } from 'redux/reducers/meetingDate';
import {
  meetingDatesSelector,
  selectMeetingDatesByMeetingStatus,
} from 'redux/selectors/meetingDate';

export const MeetingDatesToggleFilters = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.meetingDatesToggleFilters',
  });

  const { upcoming, passed } = useAppSelector(
    selectMeetingDatesByMeetingStatus
  );

  const dispatch = useAppDispatch();
  const {
    meetingDates: { filters },
  } = useAppSelector(meetingDatesSelector);

  const filterByDate = (status: MeetingDateStatus) => {
    dispatch(setMeetingDateFilters({ meetingStatus: status }));
  };

  const toggleFilters = [
    {
      status: MeetingDateStatus.Upcoming,
      label: t(MeetingDateStatus.Upcoming),
      count: upcoming.length,
      testId: `meeting-dates-filters__btn--${MeetingDateStatus.Upcoming}`,
    },
    {
      status: MeetingDateStatus.Passed,
      label: t(MeetingDateStatus.Passed),
      count: passed.length,
      testId: `meeting-dates-filters__btn--${MeetingDateStatus.Passed}`,
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
