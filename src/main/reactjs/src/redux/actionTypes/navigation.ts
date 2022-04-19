import { Action } from 'redux';

import { UIStates } from 'enums/app';

export const DISPLAY_UI_STATE = 'UI_STATE/DISPLAY';

export type DisplayUIStateActionType = {
  type: typeof DISPLAY_UI_STATE;
  state: UIStates;
};

export function isDisplayUIStateAction(
  action: Action
): action is DisplayUIStateActionType {
  return action.type == DISPLAY_UI_STATE;
}
