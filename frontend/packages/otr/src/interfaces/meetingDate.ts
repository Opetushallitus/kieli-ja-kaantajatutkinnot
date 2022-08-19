import { Dayjs } from 'dayjs';
import { WithId, WithVersion } from 'shared/interfaces';

import { MeetingDateStatus } from 'enums/meetingDate';

export interface MeetingDateFilter {
  meetingStatus: MeetingDateStatus;
}

export interface MeetingDate extends Omit<MeetingDateResponse, 'date'> {
  date: Dayjs;
}

export interface MeetingDateResponse extends WithId, WithVersion {
  date: string;
}
