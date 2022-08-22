import { Dayjs } from 'dayjs';

import { MeetingDateStatus } from 'enums/meetingDate';
import { WithId, WithVersion } from 'interfaces/with';

export interface MeetingDateFilter {
  meetingStatus: MeetingDateStatus;
}

export interface MeetingDate extends Omit<MeetingDateResponse, 'date'> {
  date: Dayjs;
}

export interface MeetingDateResponse extends WithId, WithVersion {
  date: string;
}
