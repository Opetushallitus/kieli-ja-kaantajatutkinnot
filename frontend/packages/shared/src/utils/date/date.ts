import dayjs, { Dayjs } from 'dayjs';

import 'dayjs/locale/fi';
import 'dayjs/locale/sv-fi';
import 'dayjs/locale/en-gb';
import { AppLanguage } from '../../enums';

export class DateUtils {
  static setDayjsLocale(locale: AppLanguage) {
    switch (locale) {
      case AppLanguage.Finnish:
        dayjs.locale('fi');
        break;
      case AppLanguage.Swedish:
        dayjs.locale('sv-fi');
        break;
      case AppLanguage.English:
        dayjs.locale('en-gb');
        break;
    }
  }

  static formatOptionalDate(date?: Dayjs) {
    if (!date) {
      return '-';
    }

    // Locale information is baked into the Dayjs instances when they are constructed.
    // We need to override the instance's locale with the locale used by the app when formating the date.
    return date.locale(dayjs.locale()).format('L');
  }

  static optionalStringToDate(dateString?: string) {
    if (dateString) {
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

  static isValidDate(date?: Dayjs) {
    return date ? date.isValid() : false;
  }
}
