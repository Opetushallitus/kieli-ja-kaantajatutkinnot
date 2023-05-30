import { AxiosError } from 'axios';

import { translateOutsideComponent } from 'configs/i18n';
import { APIError } from 'enums/api';

export class NotifierUtils {
  static getURLErrorMessage(error: string) {
    const t = translateOutsideComponent();

    return Object.values(APIError).includes(error as APIError)
      ? t(`vkt.common.errors.api.${error}`)
      : t('vkt.common.errors.api.generic');
  }

  static getAPIErrorMessage(error: AxiosError) {
    const t = translateOutsideComponent();
    const apiError = NotifierUtils.getAPIError(error);

    return apiError
      ? t(`vkt.common.errors.api.${apiError}`)
      : t('vkt.common.errors.api.generic');
  }

  private static getAPIError(error: AxiosError) {
    const errorCode = error.response?.data.errorCode;

    if (errorCode && Object.values(APIError).includes(errorCode)) {
      return errorCode;
    }
  }
}
