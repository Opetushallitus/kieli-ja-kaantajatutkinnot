import { Action } from 'redux';

import { PublicUIViews } from 'enums/app';

export const DISPLAY_PUBLIC_VIEW = 'UI_STATE/DISPLAY_PUBLIC_VIEW';

export type SetPublicUIViewActionType = {
  type: typeof DISPLAY_PUBLIC_VIEW;
  view: PublicUIViews;
};

export function isSetPublicUIViewActionType(
  action: Action
): action is SetPublicUIViewActionType {
  return action.type == DISPLAY_PUBLIC_VIEW;
}
