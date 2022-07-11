import { Reducer } from 'redux';
import { APIResponseStatus } from 'shared/enums';

import { ClerkUserAction, ClerkUserState } from 'interfaces/clerkUser';
import {
  CLERK_USER_ERROR,
  CLERK_USER_LOAD,
  CLERK_USER_RECEIVED,
} from 'redux/actionTypes/clerkUser';

const defaultState = {
  status: APIResponseStatus.NotStarted,
  isAuthenticated: false,
  oid: '',
};

export const clerkUserReducer: Reducer<ClerkUserState, ClerkUserAction> = (
  state = defaultState,
  action
) => {
  switch (action.type) {
    case CLERK_USER_LOAD:
      return {
        ...state,
        status: APIResponseStatus.InProgress,
      };
    case CLERK_USER_RECEIVED:
      return {
        ...state,
        status: APIResponseStatus.Success,
        isAuthenticated: true,
        oid: action?.clerkUser.oid,
      };
    case CLERK_USER_ERROR:
      return {
        ...state,
        status: APIResponseStatus.Error,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};
