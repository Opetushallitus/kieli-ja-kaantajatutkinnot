import { Severity, Variant } from 'shared/enums';

import { NotifierUtils } from 'utils/notifier';

export const toastsArray = [
  NotifierUtils.createNotifierToast(Severity.Error, 'Test Message 1'),
  NotifierUtils.createNotifierToast(Severity.Info, 'Test Message 2'),
  NotifierUtils.createNotifierToast(Severity.Success, 'Test Message 3'),
];

export const dialogsArray = [
  NotifierUtils.createNotifierDialog(
    'Test Title 1',
    Severity.Info,
    'Test Description 1',
    [
      {
        title: 'Test Action 1',
        variant: Variant.Outlined,
        action: () => undefined,
      },
    ]
  ),
];

export const emptyNotifierState = { dialogs: [], toasts: [] };

export const notifierState = {
  toasts: toastsArray,
  dialogs: dialogsArray,
};
