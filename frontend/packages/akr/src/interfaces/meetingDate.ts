import { Dayjs } from 'dayjs';

import { MeetingStatus } from 'enums/meetingDate';
import { WithId, WithVersion } from 'interfaces/with';

export interface MeetingDates {
  meetingDates: Array<MeetingDate>;
}

export interface MeetingDateFilter {
  meetingStatus: MeetingStatus;
}

export interface MeetingDate extends Omit<MeetingDateResponse, 'date'> {
  date: Dayjs;
}
export interface MeetingDateResponse extends WithId, WithVersion {
  date: string;
}
