import { AxiosError } from 'axios';
import { Severity } from 'shared/enums';

import { translateOutsideComponent } from 'configs/i18n';
import { APIError } from 'enums/api';

export class NotifierUtils {
  static createAxiosErrorNotifierToast(error: AxiosError) {
    const t = translateOutsideComponent();
    const apiError = NotifierUtils.getAPIError(error);

    const message = apiError
      ? t(`akr.errors.api.${apiError}`)
      : t('akr.errors.api.generic');

    return NotifierUtils.createNotifierToast(Severity.Error, message);
  }

  private static getAPIError(error: AxiosError) {
    const errorCode = error.response?.data.errorCode;

    if (errorCode && Object.values(APIError).includes(errorCode)) {
      return errorCode;
    }
  }
}
