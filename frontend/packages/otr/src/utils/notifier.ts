import { AxiosError } from 'axios';
import { Duration, NotifierTypes, Severity } from 'shared/enums';
import { CommonUtils } from 'shared/utils';

import { translateOutsideComponent } from 'configs/i18n';
import { APIError } from 'enums/api';
import { Dialog, DialogButtonAction, Toast } from 'interfaces/notifier';

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
      id: CommonUtils.createUniqueId(),
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
      id: CommonUtils.createUniqueId(),
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
      ? t(`otr.errors.api.${apiError}`)
      : t('otr.errors.api.generic');

    return NotifierUtils.createNotifierToast(Severity.Error, message);
  }

  private static getAPIError(error: AxiosError) {
    const errorCode = error.response?.data.errorCode;

    if (errorCode && Object.values(APIError).includes(errorCode)) {
      return errorCode;
    }
  }
}
