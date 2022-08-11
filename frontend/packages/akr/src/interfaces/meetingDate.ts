import { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';

import { MeetingStatus } from 'enums/meetingDate';
import { WithId, WithVersion } from 'interfaces/with';

export interface MeetingDates {
  meetingDates: Array<MeetingDate>;
}

export interface MeetingDateFilter {
  meetingStatus: MeetingStatus;
}
export interface MeetingDatesState {
  status: APIResponseStatus;
  filters: MeetingDateFilter;
  meetingDates: Array<MeetingDate>;
}

export interface AddMeetingDateState {
  status: APIResponseStatus;
  date: Dayjs;
}

export interface MeetingDateState {
  meetingDates: MeetingDatesState;
  addMeetingDate: AddMeetingDateState;
  removeMeetingDate: RemoveMeetingDateState;
}

export interface MeetingDate extends Omit<MeetingDateResponse, 'date'> {
  date: Dayjs;
}
export interface MeetingDateResponse extends WithId, WithVersion {
  date: string;
}
export interface RemoveMeetingDateState {
  status: APIResponseStatus;
  meetingDateId: number | undefined;
}
