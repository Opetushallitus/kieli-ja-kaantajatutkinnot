import { AxiosError } from 'axios';
import { Duration, NotifierTypes, Severity } from 'shared/enums';

import { translateOutsideComponent } from 'configs/i18n';
import { APIError } from 'enums/api';
import { Dialog, DialogButtonAction, Toast } from 'interfaces/notifier';
import { Utils } from 'utils';

export class NotifierUtils {
  static createNotifierDialog(
    title: string,
    severity: Severity,
    description: string,
    actions: DialogButtonAction[],
    timeOut: number | undefined = undefined,
    onClose?: () => void
  ) {
    const notifier: Dialog = {
      id: Utils.createUniqueId(),
      type: NotifierTypes.Dialog,
      title,
      severity,
      description,
      actions,
      timeOut,
      onClose,
    };

    return notifier;
  }

  static createNotifierToast(
    severity: Severity,
    description: string,
    timeOut: number | undefined = Duration.Medium
  ) {
    const notifier: Toast = {
      id: Utils.createUniqueId(),
      type: NotifierTypes.Toast,
      severity,
      description,
      timeOut,
    };

    return notifier;
  }

  static createAxiosErrorNotifierToast(error: AxiosError) {
    const t = translateOutsideComponent();
    const apiError = NotifierUtils.getAPIError(error);

    const message = apiError
      ? t(`akt.errors.api.${apiError}`)
      : t('akt.errors.api.generic');

    return NotifierUtils.createNotifierToast(Severity.Error, message);
  }

  private static getAPIError(error: AxiosError) {
    const errorCode = error.response?.data.errorCode;

    if (errorCode && Object.values(APIError).includes(errorCode)) {
      return errorCode;
    }
  }
}
