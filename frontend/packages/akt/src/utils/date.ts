import dayjs, { Dayjs } from 'dayjs';

import { getCurrentLang } from 'configs/i18n';

export class DateUtils {
  static dayjs() {
    dayjs.locale(getCurrentLang());

    return dayjs;
  }

  static formatOptionalDate(date?: Dayjs) {
    if (!date) {
      return '-';
    }

    return date.format('D.M.YYYY');
  }

  static optionalStringToDate(dateString?: string) {
    if (dateString) {
      const dayjs = DateUtils.dayjs();

      return dayjs(dateString);
    }
  }

  static isDatePartBefore(before: Dayjs, after: Dayjs) {
    return before.isBefore(after, 'day');
  }

  static isDatePartEqual(before: Dayjs, after: Dayjs) {
    return before.isSame(after, 'day');
  }

  static isDatePartBeforeOrEqual(before: Dayjs, after: Dayjs) {
    return (
      this.isDatePartBefore(before, after) ||
      this.isDatePartEqual(before, after)
    );
  }

  static serializeDate(date?: Dayjs) {
    return date?.format('YYYY-MM-DD');
  }
}
