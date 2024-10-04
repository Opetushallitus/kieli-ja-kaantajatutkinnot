import { Dayjs } from 'dayjs';
import { DateUtils } from 'shared/utils';

import { translateOutsideComponent } from 'configs/i18n';

export class DateTimeUtils {
  static renderDateTime(dateTime?: Dayjs) {
    const t = translateOutsideComponent();

    return DateUtils.formatOptionalDateTime(
      dateTime,
      t('vkt.common.dates.dateTimeFormat'),
    );
  }

  static renderOpenDateTime(dateTime?: Dayjs) {
    const t = translateOutsideComponent();

    return (
      DateUtils.formatOptionalDate(dateTime, t('vkt.common.dates.dateFormat')) +
      ' ' +
      t('vkt.common.dates.registrationOpensAt')
    );
  }

  static renderCloseDateTime(dateTime?: Dayjs) {
    const t = translateOutsideComponent();

    return (
      DateUtils.formatOptionalDate(dateTime, t('vkt.common.dates.dateFormat')) +
      ' ' +
      t('vkt.common.dates.registrationClosesAt')
    );
  }

  static renderTime(dateTime?: Dayjs) {
    const t = translateOutsideComponent();

    return DateUtils.formatOptionalTime(
      dateTime,
      t('vkt.common.dates.timeFormat'),
    );
  }

  static renderDate(dateTime?: Dayjs) {
    const t = translateOutsideComponent();

    return DateUtils.formatOptionalDateTime(
      dateTime,
      t('vkt.common.dates.dateFormat'),
    );
  }
}
