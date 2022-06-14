import { Color, NotifierTypes, Severity, Variant } from '../enums';

export interface DialogButtonAction {
  title: string;
  variant: `${Variant}`;
  action?: () => void;
  buttonColor?: Color;
  dataTestId?: string;
}

export interface Notifier {
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
  actions?: Array<DialogButtonAction>;
}
