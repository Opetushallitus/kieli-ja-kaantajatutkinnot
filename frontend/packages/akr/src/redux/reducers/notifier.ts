import { Reducer } from 'redux';

import {
  Dialog,
  NotifierAction,
  NotifierState,
  Toast,
} from 'interfaces/notifier';
import {
  NOTIFIER_DIALOG_ADD,
  NOTIFIER_DIALOG_REMOVE,
  NOTIFIER_TOAST_ADD,
  NOTIFIER_TOAST_REMOVE,
} from 'redux/actionTypes/notifier';

const defaultState = {
  dialogs: [],
  toasts: [],
};

export const notifierReducer: Reducer<NotifierState, NotifierAction> = (
  state = defaultState,
  action
) => {
  switch (action.type) {
    case NOTIFIER_DIALOG_ADD:
      return {
        ...state,
        dialogs: [...state.dialogs, <Dialog>action.notifier],
      };
    case NOTIFIER_DIALOG_REMOVE:
      return {
        ...state,
        dialogs: state.dialogs.filter((d) => d.id != action.id),
      };
    case NOTIFIER_TOAST_ADD:
      return {
        ...state,
        toasts: [...state.toasts, <Toast>action.notifier],
      };
    case NOTIFIER_TOAST_REMOVE:
      return {
        ...state,
        toasts: state.toasts.filter((d) => d.id != action.id),
      };
    default:
      return state;
  }
};
