import { Action, Reducer } from 'redux';

import { PublicUIViews } from 'enums/app';
import { PublicUIView } from 'interfaces/publicUIView';
import { isSetPublicUIViewActionType } from 'redux/actionTypes/publicUIView';

const defaultState = {
  currentView: PublicUIViews.PublicTranslatorListing,
};

export const publicUIViewReducer: Reducer<PublicUIView, Action> = (
  state = defaultState,
  action
) => {
  if (isSetPublicUIViewActionType(action)) {
    return { currentView: action.view };
  }

  return state;
};
