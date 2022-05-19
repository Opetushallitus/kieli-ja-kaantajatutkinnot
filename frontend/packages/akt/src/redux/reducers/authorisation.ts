import { Reducer } from 'redux';
import { APIResponseStatus } from 'shared/enums';

import {
  AddAuthorisationAction,
  AddAuthorisationState,
} from 'interfaces/authorisation';
import {
  CLERK_TRANSLATOR_AUTHORISATION_ADD,
  CLERK_TRANSLATOR_AUTHORISATION_ADD_ERROR,
  CLERK_TRANSLATOR_AUTHORISATION_ADD_SUCCESS,
} from 'redux/actionTypes/authorisation';

const defaultState = {
  status: APIResponseStatus.NotStarted,
  authorisation: {},
};

export const authorisationReducer: Reducer<
  AddAuthorisationState,
  AddAuthorisationAction
> = (state = defaultState, action) => {
  const authorisation = action.authorisation;

  switch (action.type) {
    case CLERK_TRANSLATOR_AUTHORISATION_ADD:
      return {
        ...state,
        authorisation,
        status: APIResponseStatus.InProgress,
      };
    case CLERK_TRANSLATOR_AUTHORISATION_ADD_SUCCESS:
      return {
        ...state,
        authorisation,
        status: APIResponseStatus.Success,
      };
    case CLERK_TRANSLATOR_AUTHORISATION_ADD_ERROR:
      return {
        ...state,
        authorisation,
        status: APIResponseStatus.Error,
      };
    default:
      return state;
  }
};
