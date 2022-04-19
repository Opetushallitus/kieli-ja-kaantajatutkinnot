import { Reducer } from 'redux';

import { APIResponseStatus } from 'enums/api';
import { AuthorisationStatus } from 'enums/clerkTranslator';
import {
  ClerkTranslator,
  ClerkTranslatorAction,
  ClerkTranslatorFilter,
  ClerkTranslatorState,
} from 'interfaces/clerkTranslator';
import {
  CLERK_TRANSLATOR_ADD_FILTER,
  CLERK_TRANSLATOR_DESELECT,
  CLERK_TRANSLATOR_DESELECT_ALL,
  CLERK_TRANSLATOR_ERROR,
  CLERK_TRANSLATOR_LOADING,
  CLERK_TRANSLATOR_RECEIVED,
  CLERK_TRANSLATOR_RESET_FILTERS,
  CLERK_TRANSLATOR_SELECT,
  CLERK_TRANSLATOR_SELECT_ALL_FILTERED,
} from 'redux/actionTypes/clerkTranslators';
import { LanguagePairsDict } from 'interfaces/language';

const defaultState = {
  status: APIResponseStatus.NotStarted,
  translators: [],
  langs: { from: [], to: [] },
  towns: [],
  selectedTranslators: [],
  filters: {
    fromLang: '',
    toLang: '',
    name: '',
    town: '',
    authorisationStatus: AuthorisationStatus.Authorised,
  },
};

export const clerkTranslatorReducer: Reducer<
  ClerkTranslatorState,
  ClerkTranslatorAction
> = (state = defaultState, action) => {
  const index = action.index as number;
  const filters = action.filters as ClerkTranslatorFilter;

  switch (action.type) {
    case CLERK_TRANSLATOR_LOADING:
      return { ...state, status: APIResponseStatus.InProgress };
    case CLERK_TRANSLATOR_RECEIVED:
      const translators = action.translators as Array<ClerkTranslator>;
      const langs = action.langs as LanguagePairsDict;
      const towns = action.towns as Array<string>;

      return {
        ...state,
        translators,
        langs,
        towns,
        status: APIResponseStatus.Success,
      };
    case CLERK_TRANSLATOR_ERROR:
      return { ...state, status: APIResponseStatus.Error };
    case CLERK_TRANSLATOR_SELECT:
      return {
        ...state,
        selectedTranslators: [...state.selectedTranslators, index],
      };
    case CLERK_TRANSLATOR_DESELECT:
      return {
        ...state,
        selectedTranslators: state.selectedTranslators.filter(
          (idx) => idx !== index
        ),
      };
    case CLERK_TRANSLATOR_SELECT_ALL_FILTERED:
      return {
        ...state,
        selectedTranslators: state.translators.map(({ id }) => id),
      };
    case CLERK_TRANSLATOR_DESELECT_ALL:
      return {
        ...state,
        selectedTranslators: [],
      };
    case CLERK_TRANSLATOR_ADD_FILTER:
      return {
        ...state,
        filters,
      };
    case CLERK_TRANSLATOR_RESET_FILTERS:
      return {
        ...state,
        filters: defaultState.filters,
      };
    default:
      return state;
  }
};
