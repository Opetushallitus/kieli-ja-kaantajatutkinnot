import { Action, Reducer } from 'redux';

import { UIStates } from 'enums/app';
import { UIState } from 'interfaces/UIState';
import { isDisplayUIStateAction } from 'redux/actionTypes/navigation';

const defaultState = { state: UIStates.PublicTranslatorListing };

export const UIStateReducer: Reducer<UIState, Action> = (
  state = defaultState,
  action
) => {
  if (isDisplayUIStateAction(action)) {
    return { state: action.state };
  }

  return state;
};
