import dayjs, { Dayjs } from 'dayjs';
import { Reducer } from 'redux';
import { APIResponseStatus } from 'shared/enums';

import { MeetingStatus } from 'enums/meetingDate';
import {
  MeetingDate,
  MeetingDateAction,
  MeetingDateFilter,
  MeetingDateState,
} from 'interfaces/meetingDate';
import {
  MEETING_DATE_ADD,
  MEETING_DATE_ADD_ERROR,
  MEETING_DATE_ADD_FILTER,
  MEETING_DATE_ADD_SUCCESS,
  MEETING_DATE_ERROR,
  MEETING_DATE_LOADING,
  MEETING_DATE_RECEIVED,
  MEETING_DATE_REMOVE,
  MEETING_DATE_REMOVE_ERROR,
  MEETING_DATE_REMOVE_SUCCESS,
} from 'redux/actionTypes/meetingDate';

const defaultState = {
  meetingDates: {
    status: APIResponseStatus.NotStarted,
    meetingDates: [],
    filters: {
      meetingStatus: MeetingStatus.Upcoming,
    },
  },
  addMeetingDate: {
    status: APIResponseStatus.NotStarted,
    date: dayjs(),
  },
  removeMeetingDate: {
    status: APIResponseStatus.NotStarted,
    meetingDateId: undefined,
  },
};

export const meetingDateReducer: Reducer<
  MeetingDateState,
  MeetingDateAction
> = (state = defaultState, action) => {
  const filters = action.filters as MeetingDateFilter;
  switch (action.type) {
    // Fetching meetings
    case MEETING_DATE_LOADING:
      return {
        ...state,
        meetingDates: {
          ...state.meetingDates,
          status: APIResponseStatus.InProgress,
        },
      };
    case MEETING_DATE_RECEIVED:
      const meetingDates = action.meetingDates as Array<MeetingDate>;

      return {
        ...state,
        meetingDates: {
          ...state.meetingDates,
          meetingDates,
          status: APIResponseStatus.Success,
        },
      };
    case MEETING_DATE_ERROR:
      return {
        ...state,
        meetingDates: {
          ...state.meetingDates,
          status: APIResponseStatus.Error,
        },
      };

    case MEETING_DATE_ADD_FILTER:
      return {
        ...state,
        meetingDates: {
          ...state.meetingDates,
          filters: { ...state.meetingDates.filters, ...filters },
        },
      };

    // Removing meetings
    case MEETING_DATE_REMOVE:
      const { meetingDateId } = action;

      return {
        ...state,
        removeMeetingDate: {
          ...state.removeMeetingDate,
          meetingDateId,
          status: APIResponseStatus.InProgress,
          error: undefined,
        },
      };
    case MEETING_DATE_REMOVE_SUCCESS:
      return {
        ...state,
        removeMeetingDate: {
          ...state.removeMeetingDate,
          status: APIResponseStatus.Success,
          error: undefined,
        },
      };
    case MEETING_DATE_REMOVE_ERROR:
      return {
        ...state,
        removeMeetingDate: {
          ...state.removeMeetingDate,
          status: APIResponseStatus.Error,
          error: action.error,
        },
      };

    // Adding meetings
    case MEETING_DATE_ADD:
      const date = action.date as Dayjs;

      return {
        ...state,
        addMeetingDate: {
          ...state.addMeetingDate,
          date,
          status: APIResponseStatus.InProgress,
          error: undefined,
        },
      };
    case MEETING_DATE_ADD_SUCCESS:
      return {
        ...state,
        addMeetingDate: {
          ...state.addMeetingDate,
          status: APIResponseStatus.Success,
          error: undefined,
        },
      };
    case MEETING_DATE_ADD_ERROR:
      return {
        ...state,
        addMeetingDate: {
          ...state.addMeetingDate,
          status: APIResponseStatus.Error,
          error: action.error,
        },
      };

    default:
      return state;
  }
};
