import { Dayjs } from 'dayjs';

import { MeetingDateFilter } from 'interfaces/meetingDate';
import {
  MEETING_DATE_ADD,
  MEETING_DATE_ADD_FILTER,
  MEETING_DATE_LOAD,
  MEETING_DATE_REMOVE,
} from 'redux/actionTypes/meetingDate';

export const removeMeetingDate = (meetingDateId: number) => ({
  type: MEETING_DATE_REMOVE,
  meetingDateId,
});

export const loadMeetingDates = {
  type: MEETING_DATE_LOAD,
};

export const setMeetingDateFilters = (filters: MeetingDateFilter) => ({
  type: MEETING_DATE_ADD_FILTER,
  filters,
});

export const addMeetingDate = (date: Dayjs) => ({
  type: MEETING_DATE_ADD,
  date,
});
