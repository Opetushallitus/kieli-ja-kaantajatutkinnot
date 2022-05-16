import { Reducer } from 'redux';

import { APIResponseStatus } from 'enums/api';
import { SearchFilter } from 'enums/app';
import {
  PublicInterpreter,
  PublicInterpreterAction,
  PublicInterpreterState,
} from 'interfaces/publicInterpreter';
import {
  PUBLIC_INTERPRETER_ADD_FILTER_ERROR,
  PUBLIC_INTERPRETER_ADD_FILTERS,
  PUBLIC_INTERPRETER_ADD_SELECTED,
  PUBLIC_INTERPRETER_EMPTY_FILTERS,
  PUBLIC_INTERPRETER_EMPTY_SELECTIONS,
  PUBLIC_INTERPRETER_ERROR,
  PUBLIC_INTERPRETER_LOADING,
  PUBLIC_INTERPRETER_RECEIVED,
  PUBLIC_INTERPRETER_REMOVE_FILTER_ERROR,
  PUBLIC_INTERPRETER_REMOVE_SELECTED,
} from 'redux/actionTypes/publicInterpreter';

const defaultState = {
  status: APIResponseStatus.NotStarted,
  selectedInterpreters: [],
  interpreters: [],
  filters: {
    errors: [],
    fromLang: 'FI',
    toLang: '',
    name: '',
    region: '',
  },
};

export const publicInterpreterReducer: Reducer<
  PublicInterpreterState,
  PublicInterpreterAction
> = (state = defaultState, action) => {
  const index = <number>action.index;
  const stateFilterErrors = <SearchFilter[]>state.filters.errors;

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
    case PUBLIC_INTERPRETER_ADD_SELECTED:
      return {
        ...state,
        selectedInterpreters: [...state.selectedInterpreters, index],
      };
    case PUBLIC_INTERPRETER_REMOVE_SELECTED:
      return {
        ...state,
        selectedInterpreters: state.selectedInterpreters.filter(
          (idx) => idx !== index
        ),
      };
    case PUBLIC_INTERPRETER_EMPTY_SELECTIONS:
      return {
        ...state,
        selectedInterpreters: [],
      };
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
    case PUBLIC_INTERPRETER_ADD_FILTER_ERROR:
      return {
        ...state,
        filters: {
          ...state.filters,
          errors: [...stateFilterErrors, <SearchFilter>action.filterErrorName],
        },
      };
    case PUBLIC_INTERPRETER_REMOVE_FILTER_ERROR:
      return {
        ...state,
        filters: {
          ...state.filters,
          errors: stateFilterErrors.filter((f) => f !== action.filterErrorName),
        },
      };
    default:
      return state;
  }
};
