import { AxiosError } from 'axios';

import { translateOutsideComponent } from 'configs/i18n';
import { APIError } from 'enums/api';

export class NotifierUtils {
  static getURLErrorMessage(error: string) {
    const t = translateOutsideComponent();

    return Object.values(APIError).includes(error as APIError)
      ? t(`yki.common.errors.api.${error}`)
      : t('yki.common.errors.api.generic');
  }

  static getAPIErrorMessage(error: AxiosError, defaultMessage?: string) {
    const t = translateOutsideComponent();
    const apiError = NotifierUtils.getAPIError(error);

    return apiError
      ? t(`yki.common.errors.api.${apiError}`)
      : defaultMessage || t('yki.common.errors.api.generic');
  }

  private static getAPIError(error: AxiosError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = error.response?.data as any;
    const errorCode = data.errorCode;

    if (errorCode && Object.values(APIError).includes(errorCode)) {
      return errorCode;
    }
  }
}
