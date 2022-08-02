import { Reducer } from 'redux';
import { APIResponseStatus } from 'shared/enums';

import { ClerkTranslator } from 'interfaces/clerkTranslator';
import {
  ClerkTranslatorOverviewAction,
  ClerkTranslatorOverviewState,
} from 'interfaces/clerkTranslatorOverview';
import {
  CLERK_TRANSLATOR_OVERVIEW_CANCEL_UPDATE,
  CLERK_TRANSLATOR_OVERVIEW_DELETE_AUTHORISATION,
  CLERK_TRANSLATOR_OVERVIEW_DELETE_AUTHORISATION_FAIL,
  CLERK_TRANSLATOR_OVERVIEW_DELETE_AUTHORISATION_SUCCESS,
  CLERK_TRANSLATOR_OVERVIEW_FETCH_FAIL,
  CLERK_TRANSLATOR_OVERVIEW_FETCH_SUCCESS,
  CLERK_TRANSLATOR_OVERVIEW_LOAD,
  CLERK_TRANSLATOR_OVERVIEW_LOADING,
  CLERK_TRANSLATOR_OVERVIEW_RESET,
  CLERK_TRANSLATOR_OVERVIEW_RESET_UPDATE,
  CLERK_TRANSLATOR_OVERVIEW_UPDATE_AUTHORISATION_PUBLISH_PERMISSION,
  CLERK_TRANSLATOR_OVERVIEW_UPDATE_AUTHORISATION_PUBLISH_PERMISSION_FAIL,
  CLERK_TRANSLATOR_OVERVIEW_UPDATE_AUTHORISATION_PUBLISH_PERMISSION_SUCCESS,
  CLERK_TRANSLATOR_OVERVIEW_UPDATE_TRANSLATOR_DETAILS,
  CLERK_TRANSLATOR_OVERVIEW_UPDATE_TRANSLATOR_DETAILS_FAIL,
  CLERK_TRANSLATOR_OVERVIEW_UPDATE_TRANSLATOR_DETAILS_SUCCESS,
} from 'redux/actionTypes/clerkTranslatorOverview';

const defaultState = {
  overviewStatus: APIResponseStatus.NotStarted,
  translatorDetailsStatus: APIResponseStatus.NotStarted,
  authorisationDetailsStatus: APIResponseStatus.NotStarted,
  selectedTranslator: undefined,
};

export const clerkTranslatorOverviewReducer: Reducer<
  ClerkTranslatorOverviewState,
  ClerkTranslatorOverviewAction
> = (state = defaultState, action) => {
  switch (action.type) {
    case CLERK_TRANSLATOR_OVERVIEW_LOAD:
      return {
        ...state,
        error: undefined,
        selectedTranslator: {
          ...(action.translator as ClerkTranslator),
        },
        status: APIResponseStatus.NotStarted,
      };

    case CLERK_TRANSLATOR_OVERVIEW_LOADING:
      return {
        ...state,
        overviewStatus: APIResponseStatus.InProgress,
      };

    case CLERK_TRANSLATOR_OVERVIEW_UPDATE_TRANSLATOR_DETAILS:
      return {
        ...state,
        error: undefined,
        translatorDetailsStatus: APIResponseStatus.InProgress,
      };

    case CLERK_TRANSLATOR_OVERVIEW_CANCEL_UPDATE:
      return {
        ...state,
        translatorDetailsStatus: APIResponseStatus.Cancelled,
      };

    case CLERK_TRANSLATOR_OVERVIEW_RESET_UPDATE:
      return {
        ...state,
        error: undefined,
        translatorDetailsStatus: APIResponseStatus.NotStarted,
      };

    case CLERK_TRANSLATOR_OVERVIEW_RESET:
      return defaultState;

    case CLERK_TRANSLATOR_OVERVIEW_FETCH_SUCCESS:
      return {
        ...state,
        error: undefined,
        selectedTranslator: {
          ...(action.translator as ClerkTranslator),
        },
        overviewStatus: APIResponseStatus.Success,
      };

    case CLERK_TRANSLATOR_OVERVIEW_UPDATE_TRANSLATOR_DETAILS_SUCCESS:
      return {
        ...state,
        error: undefined,
        selectedTranslator: {
          ...(action.translator as ClerkTranslator),
        },
        overviewStatus: APIResponseStatus.Success,
        translatorDetailsStatus: APIResponseStatus.Success,
      };

    case CLERK_TRANSLATOR_OVERVIEW_FETCH_FAIL:
      return {
        ...state,
        overviewStatus: APIResponseStatus.Error,
      };

    case CLERK_TRANSLATOR_OVERVIEW_UPDATE_TRANSLATOR_DETAILS_FAIL:
      return {
        ...state,
        translatorDetailsStatus: APIResponseStatus.Error,
        error: action.error,
      };

    case CLERK_TRANSLATOR_OVERVIEW_UPDATE_AUTHORISATION_PUBLISH_PERMISSION:
      return {
        ...state,
        error: undefined,
        authorisationDetailsStatus: APIResponseStatus.InProgress,
      };

    case CLERK_TRANSLATOR_OVERVIEW_UPDATE_AUTHORISATION_PUBLISH_PERMISSION_SUCCESS:
      return {
        ...state,
        selectedTranslator: {
          ...(action.translator as ClerkTranslator),
        },
        error: undefined,
        authorisationDetailsStatus: APIResponseStatus.Success,
      };

    case CLERK_TRANSLATOR_OVERVIEW_UPDATE_AUTHORISATION_PUBLISH_PERMISSION_FAIL:
      return {
        ...state,
        authorisationDetailsStatus: APIResponseStatus.Error,
        error: action.error,
      };

    case CLERK_TRANSLATOR_OVERVIEW_DELETE_AUTHORISATION:
      return {
        ...state,
        error: undefined,
        authorisationDetailsStatus: APIResponseStatus.InProgress,
      };

    case CLERK_TRANSLATOR_OVERVIEW_DELETE_AUTHORISATION_SUCCESS:
      return {
        ...state,
        error: undefined,
        selectedTranslator: {
          ...(action.translator as ClerkTranslator),
        },
        authorisationDetailsStatus: APIResponseStatus.Success,
      };

    case CLERK_TRANSLATOR_OVERVIEW_DELETE_AUTHORISATION_FAIL:
      return {
        ...state,
        authorisationDetailsStatus: APIResponseStatus.Error,
        error: action.error,
      };

    default:
      return state;
  }
};
