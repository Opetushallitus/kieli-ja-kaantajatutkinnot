import { Reducer } from 'redux';

import { APIResponseStatus } from 'enums/api';
import {
  ClerkTranslatorEmailAction,
  ClerkTranslatorEmailState,
} from 'interfaces/clerkTranslatorEmail';
import {
  CLERK_TRANSLATOR_EMAIL_CANCEL,
  CLERK_TRANSLATOR_EMAIL_ERROR,
  CLERK_TRANSLATOR_EMAIL_RESET,
  CLERK_TRANSLATOR_EMAIL_SEND,
  CLERK_TRANSLATOR_EMAIL_SET,
  CLERK_TRANSLATOR_EMAIL_SET_RECIPIENTS,
  CLERK_TRANSLATOR_EMAIL_SUCCESS,
} from 'redux/actionTypes/clerkTranslatorEmail';

const defaultState = {
  status: APIResponseStatus.NotStarted,
  email: {
    subject: '',
    body: '',
  },
  recipients: [],
};

export const clerkTranslatorEmailReducer: Reducer<
  ClerkTranslatorEmailState,
  ClerkTranslatorEmailAction
> = (state = defaultState, action) => {
  switch (action.type) {
    case CLERK_TRANSLATOR_EMAIL_SEND:
      return {
        ...state,
        status: APIResponseStatus.InProgress,
      };
    case CLERK_TRANSLATOR_EMAIL_SET:
      return { ...state, email: { ...state.email, ...action.email } };
    case CLERK_TRANSLATOR_EMAIL_SET_RECIPIENTS:
      return { ...state, recipients: action.recipientIds };
    case CLERK_TRANSLATOR_EMAIL_RESET:
      return defaultState;
    case CLERK_TRANSLATOR_EMAIL_SUCCESS:
      return { ...state, status: APIResponseStatus.Success };
    case CLERK_TRANSLATOR_EMAIL_ERROR:
      return { ...state, status: APIResponseStatus.Error };
    case CLERK_TRANSLATOR_EMAIL_CANCEL:
      return { ...state, status: APIResponseStatus.Cancelled };
    default:
      return state;
  }
};
