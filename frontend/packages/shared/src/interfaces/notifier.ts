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
  timeOut?: number;
  onClose?: () => void;
}

export interface Toast extends Notifier {
  type: NotifierTypes.Toast;
  description: string;
}

export interface Dialog extends Notifier {
  type: NotifierTypes.Dialog;
  title: string;
  description?: string;
  content?: React.ReactNode;
  actions?: Array<DialogButtonAction>;
}
