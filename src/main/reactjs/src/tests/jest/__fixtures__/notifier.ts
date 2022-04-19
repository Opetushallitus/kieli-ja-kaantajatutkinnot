import { Utils } from 'utils';
import { Variant, Severity } from 'enums/app';
import { NOTIFIER_ACTION_DO_NOTHING } from 'redux/actionTypes/notifier';

export const toastsArray = [
  Utils.createNotifierToast(Severity.Error, 'Test Message 1'),
  Utils.createNotifierToast(Severity.Info, 'Test Message 2'),
  Utils.createNotifierToast(Severity.Success, 'Test Message 3'),
];

export const dialogsArray = [
  Utils.createNotifierDialog(
    'Test Title 1',
    Severity.Info,
    'Test Description 1',
    [
      {
        title: 'Test Action 1',
        variant: Variant.Outlined,
        action: NOTIFIER_ACTION_DO_NOTHING,
      },
    ]
  ),
];

export const emptyNotifierState = { dialogs: [], toasts: [] };

export const notifierState = {
  toasts: toastsArray,
  dialogs: dialogsArray,
};
