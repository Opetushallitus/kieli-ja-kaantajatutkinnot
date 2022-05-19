import { Reducer } from 'redux';
import { APIResponseStatus } from 'shared/enums';

import {
  PublicInterpreter,
  PublicInterpreterAction,
  PublicInterpreterState,
} from 'interfaces/publicInterpreter';
import {
  PUBLIC_INTERPRETER_ADD_FILTERS,
  PUBLIC_INTERPRETER_EMPTY_FILTERS,
  PUBLIC_INTERPRETER_ERROR,
  PUBLIC_INTERPRETER_LOADING,
  PUBLIC_INTERPRETER_RECEIVED,
} from 'redux/actionTypes/publicInterpreter';

const defaultState = {
  status: APIResponseStatus.NotStarted,
  interpreters: [],
  filters: {
    errors: [],
    fromLang: '',
    toLang: '',
    name: '',
    region: '',
  },
};

export const publicInterpreterReducer: Reducer<
  PublicInterpreterState,
  PublicInterpreterAction
> = (state = defaultState, action) => {
  switch (action.type) {
    case PUBLIC_INTERPRETER_LOADING:
      return {
        ...state,
        status: APIResponseStatus.InProgress,
      };
    case PUBLIC_INTERPRETER_RECEIVED:
      return {
        ...state,
        status: APIResponseStatus.Success,
        interpreters: <Array<PublicInterpreter>>action.interpreters,
      };
    case PUBLIC_INTERPRETER_ERROR:
      return { ...state, status: APIResponseStatus.Error };
    case PUBLIC_INTERPRETER_ADD_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
      };
    case PUBLIC_INTERPRETER_EMPTY_FILTERS:
      return {
        ...state,
        filters: { ...defaultState.filters },
      };
    default:
      return state;
  }
};
