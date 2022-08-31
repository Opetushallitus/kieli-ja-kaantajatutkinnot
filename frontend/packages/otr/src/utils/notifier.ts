import { AxiosError } from 'axios';

import { translateOutsideComponent } from 'configs/i18n';
import { APIError } from 'enums/api';

export class NotifierUtils {
  static getAPIErrorMessage(error: AxiosError) {
    const t = translateOutsideComponent();
    const apiError = NotifierUtils.getAPIError(error);

    const message = apiError
      ? t(`otr.errors.api.${apiError}`)
      : t('otr.errors.api.generic');

    return message;
  }

  private static getAPIError(error: AxiosError) {
    const errorCode = error.response?.data.errorCode;

    if (errorCode && Object.values(APIError).includes(errorCode)) {
      return errorCode;
    }
  }
}
