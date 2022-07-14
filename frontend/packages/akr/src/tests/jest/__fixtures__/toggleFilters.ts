import { MeetingStatus } from 'enums/meetingDate';

export const meetingDateToggleFilters = [
  {
    status: MeetingStatus.Upcoming,
    count: 10,
    label: 'label',
  },
  {
    status: MeetingStatus.Passed,
    count: 20,
    label: 'label2',
  },
];
