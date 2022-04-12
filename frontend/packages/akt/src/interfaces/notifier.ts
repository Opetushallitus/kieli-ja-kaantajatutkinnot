import { Action } from 'redux';

import { Color, NotifierTypes, Severity, Variant } from 'enums/app';
export interface NotifierButtonAction {
  title: string;
  variant: `${Variant}`;
  action: string | (() => void);
  payload?: unknown;
  buttonColor?: Color;
  dataTestId?: string;
}

export interface Notifier {
  id: string;
  severity: `${Severity}`;
  description: string;
  timeOut?: number;
  actions?: Array<NotifierButtonAction>;
}

export interface Toast extends Notifier {
  type: NotifierTypes.Toast;
}

export interface Dialog extends Notifier {
  type: NotifierTypes.Dialog;
  title: string;
}

export interface NotifierState {
  dialogs: Array<Dialog>;
  toasts: Array<Toast>;
}

export interface NotifierAction extends Action {
  id?: string;
  notifier?: Notifier;
  toasts?: Notifier;
}
