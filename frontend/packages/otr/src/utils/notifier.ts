import { AxiosError } from 'axios';

import { translateOutsideComponent } from 'configs/i18n';
import { APIError } from 'enums/api';

export class NotifierUtils {
  static getAPIErrorMessage(error: AxiosError) {
    const t = translateOutsideComponent();
    const apiError = NotifierUtils.getAPIError(error);

    return apiError
      ? t(`otr.errors.api.${apiError}`)
      : t('otr.errors.api.generic');
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
