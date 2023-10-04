import { Dayjs } from 'dayjs';
import { DateUtils } from 'shared/utils';

import { translateOutsideComponent } from 'configs/i18n';

export class DateTimeUtils {
  static renderDateTime(dateTime?: Dayjs) {
    const t = translateOutsideComponent();

    return DateUtils.formatOptionalDateTime(
      dateTime,
      t('yki.common.dates.dateTimeFormat')
    );
  }

  static isBeforeOrEqual(a: Dayjs, b: Dayjs) {
    // Note: need to first convert to utc because of poor support in Dayjs
    // for comparing times across timezones.
    const d1 = a.utc();
    const d2 = b.utc();

    return d1.isBefore(d2) || d1.isSame(2);
  }
}
