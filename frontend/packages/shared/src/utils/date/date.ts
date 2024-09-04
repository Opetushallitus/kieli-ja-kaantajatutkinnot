import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import 'dayjs/locale/fi';
import 'dayjs/locale/sv-fi';
import 'dayjs/locale/en-gb';
import { AppLanguage } from '../../enums';

dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

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

  static formatOptionalTime(date?: Dayjs, format = 'HH:mm') {
    if (!date) {
      return '-';
    }

    // Locale information is baked into the Dayjs instances when they are constructed.
    // We need to override the instance's locale with the locale used by the app when formating the date.
    return date.locale(dayjs.locale()).format(format);
  }

  static formatOptionalDate(date?: Dayjs, format = 'L') {
    if (!date) {
      return '-';
    }

    // Locale information is baked into the Dayjs instances when they are constructed.
    // We need to override the instance's locale with the locale used by the app when formating the date.
    return date.locale(dayjs.locale()).format(format);
  }

  static formatOptionalDateTime(date?: Dayjs, format = 'L HH:mm') {
    if (!date) {
      return '-';
    }

    // Locale information is baked into the Dayjs instances when they are constructed.
    // We need to override the instance's locale with the locale used by the app when formating the date.
    return date.locale(dayjs.locale()).format(format);
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

  static serializeDateTime(date?: Dayjs) {
    return date?.format('YYYY-MM-DDTHH:mm:ss');
  }

  static isValidDate(date?: Dayjs) {
    return date ? date.isValid() : false;
  }

  static parseDateString(dateString?: string) {
    const date = dayjs(
      dateString,
      ['D.M.YYYY', 'D.MM.YYYY', 'DD.M.YYYY', 'DD.MM.YYYY'],
      true,
    );
    if (date.isValid()) {
      return date;
    }
  }
}
