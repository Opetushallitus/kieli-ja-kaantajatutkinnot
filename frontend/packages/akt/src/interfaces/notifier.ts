import { Action } from 'redux';
import { Color, NotifierTypes, Severity, Variant } from 'shared/enums';

export interface DialogButtonAction {
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
}

export interface Toast extends Notifier {
  type: NotifierTypes.Toast;
}

export interface Dialog extends Notifier {
  type: NotifierTypes.Dialog;
  title: string;
  onClose?: () => void;
  actions?: Array<DialogButtonAction>;
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
