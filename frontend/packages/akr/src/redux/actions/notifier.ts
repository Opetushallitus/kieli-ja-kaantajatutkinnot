import { dispatchOutsideComponent } from 'configs/redux';
import { Dialog, Toast } from 'interfaces/notifier';
import {
  NOTIFIER_DIALOG_ADD,
  NOTIFIER_DIALOG_REMOVE,
  NOTIFIER_TOAST_ADD,
  NOTIFIER_TOAST_REMOVE,
} from 'redux/actionTypes/notifier';

export const showNotifierDialog = (notifier: Dialog) => {
  if (notifier.timeOut) {
    setTimeout(() => {
      dispatchOutsideComponent(removeNotifierDialog(notifier.id));
    }, notifier.timeOut);
  }

  return {
    type: NOTIFIER_DIALOG_ADD,
    notifier,
  };
};

export const removeNotifierDialog = (id: string) => ({
  type: NOTIFIER_DIALOG_REMOVE,
  id,
});

export const showNotifierToast = (notifier: Toast) => ({
  type: NOTIFIER_TOAST_ADD,
  notifier,
});

export const removeNotifierToast = (id: string) => ({
  type: NOTIFIER_TOAST_REMOVE,
  id,
});

export const executeNotifierAction = (action: string) => ({
  type: action,
});
