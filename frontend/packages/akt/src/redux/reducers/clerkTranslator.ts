import { Reducer } from 'redux';

import { APIResponseStatus } from 'enums/api';
import { AuthorisationStatus } from 'enums/clerkTranslator';
import { ClerkStateAction, ClerkUIState } from 'interfaces/clerkState';
import {
  ClerkTranslator,
  ClerkTranslatorFilter,
} from 'interfaces/clerkTranslator';
import { LanguagePairsDict } from 'interfaces/languagePair';
import { MeetingDate } from 'interfaces/meetingDate';
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

const defaultState = {
  status: APIResponseStatus.NotStarted,
  translators: [],
  langs: { from: [], to: [] },
  meetingDates: [],
  selectedTranslators: [],
  filters: {
    authorisationStatus: AuthorisationStatus.Authorised,
  },
};

export const clerkTranslatorReducer: Reducer<ClerkUIState, ClerkStateAction> = (
  state = defaultState,
  action
) => {
  const index = action.index as number;
  const filters = action.filters as Partial<ClerkTranslatorFilter>;

  switch (action.type) {
    case CLERK_TRANSLATOR_LOADING:
      return { ...state, status: APIResponseStatus.InProgress };
    case CLERK_TRANSLATOR_RECEIVED:
      const translators = action.translators as Array<ClerkTranslator>;
      const langs = action.langs as LanguagePairsDict;
      const meetingDates = action.meetingDates as Array<MeetingDate>;

      return {
        ...state,
        translators,
        langs,
        meetingDates,
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
        filters: { ...state.filters, ...filters },
      };
    // TODO: should clear content in name search component
    case CLERK_TRANSLATOR_RESET_FILTERS:
      return {
        ...state,
        filters: defaultState.filters,
        selectedTranslators: defaultState.selectedTranslators,
      };
    default:
      return state;
  }
};
