import { Reducer } from 'redux';

import { APIResponseStatus } from 'enums/api';
import { SearchFilter } from 'enums/app';
import {
  PublicTranslator,
  PublicTranslatorAction,
  PublicTranslatorState,
} from 'interfaces/publicTranslator';
import {
  PUBLIC_TRANSLATOR_ADD_FILTER_ERROR,
  PUBLIC_TRANSLATOR_ADD_FILTERS,
  PUBLIC_TRANSLATOR_ADD_SELECTED,
  PUBLIC_TRANSLATOR_EMPTY_FILTERS,
  PUBLIC_TRANSLATOR_EMPTY_SELECTIONS,
  PUBLIC_TRANSLATOR_ERROR,
  PUBLIC_TRANSLATOR_LOADING,
  PUBLIC_TRANSLATOR_RECEIVED,
  PUBLIC_TRANSLATOR_REMOVE_FILTER_ERROR,
  PUBLIC_TRANSLATOR_REMOVE_SELECTED,
} from 'redux/actionTypes/publicTranslator';

const defaultState = {
  status: APIResponseStatus.NotStarted,
  selectedTranslators: [],
  translators: [],
  filters: {
    errors: [],
    fromLang: '',
    toLang: '',
    name: '',
    region: '',
  },
};

export const publicTranslatorReducer: Reducer<
  PublicTranslatorState,
  PublicTranslatorAction
> = (state = defaultState, action) => {
  const index = <number>action.index;
  const stateFilterErrors = <SearchFilter[]>state.filters.errors;

  switch (action.type) {
    case PUBLIC_TRANSLATOR_LOADING:
      return {
        ...state,
        status: APIResponseStatus.InProgress,
      };
    case PUBLIC_TRANSLATOR_RECEIVED:
      return {
        ...state,
        status: APIResponseStatus.Success,
        translators: <Array<PublicTranslator>>action.translators,
      };
    case PUBLIC_TRANSLATOR_ERROR:
      return { ...state, status: APIResponseStatus.Error };
    case PUBLIC_TRANSLATOR_ADD_SELECTED:
      return {
        ...state,
        selectedTranslators: [...state.selectedTranslators, index],
      };
    case PUBLIC_TRANSLATOR_REMOVE_SELECTED:
      return {
        ...state,
        selectedTranslators: state.selectedTranslators.filter(
          (idx) => idx !== index
        ),
      };
    case PUBLIC_TRANSLATOR_EMPTY_SELECTIONS:
      return {
        ...state,
        selectedTranslators: [],
      };
    case PUBLIC_TRANSLATOR_ADD_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
      };
    case PUBLIC_TRANSLATOR_EMPTY_FILTERS:
      return {
        ...state,
        filters: { ...defaultState.filters },
      };
    case PUBLIC_TRANSLATOR_ADD_FILTER_ERROR:
      return {
        ...state,
        filters: {
          ...state.filters,
          errors: [...stateFilterErrors, <SearchFilter>action.filterErrorName],
        },
      };
    case PUBLIC_TRANSLATOR_REMOVE_FILTER_ERROR:
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
