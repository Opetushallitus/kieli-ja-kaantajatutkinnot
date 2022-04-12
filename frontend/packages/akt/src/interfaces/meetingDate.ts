import { Dayjs } from 'dayjs';
import { Action } from 'redux';

import { APIResponseStatus } from 'enums/api';
import { MeetingStatus } from 'enums/meetingDate';
import { WithId, WithVersion } from 'interfaces/with';
import {
  MEETING_DATE_ADD,
  MEETING_DATE_REMOVE,
} from 'redux/actionTypes/meetingDate';

export interface MeetingDates {
  meetingDates: Array<MeetingDate>;
}

export interface MeetingDateFilter {
  meetingStatus: MeetingStatus;
}
export interface MeetingDatesState {
  status: APIResponseStatus;
  filters: MeetingDateFilter;
  meetingDates: MeetingDate[];
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

export interface MeetingDateAction
  extends Action<string>,
    Partial<MeetingDates> {
  filters?: MeetingDateFilter;
  meetingDateId?: number;
  status?: APIResponseStatus;
  date?: Dayjs;
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

export interface RemoveMeetingDateAction extends Action<string> {
  meetingDateId: number;
}

export interface AddMeetingDateAction extends Action<string> {
  date: Dayjs;
}

export type AddMeetingDateActionType = {
  type: typeof MEETING_DATE_ADD;
  date: Dayjs;
};

export type RemoveMeetingDateActionType = {
  type: typeof MEETING_DATE_REMOVE;
  meetingDateId: number;
};
