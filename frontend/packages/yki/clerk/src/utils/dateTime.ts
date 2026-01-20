import { Dayjs } from 'dayjs';
import { DateUtils } from 'shared/utils';

import { translateOutsideComponent } from 'configs/i18n';

export class DateTimeUtils {
  static renderDateTime(dateTime?: Dayjs) {
    const t = translateOutsideComponent();

    return DateUtils.formatOptionalDateTime(
      dateTime,
      t('yki.common.dates.dateTimeFormat'),
    );
  }
}
