import { Dayjs } from 'dayjs';
import { AppLanguage } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { translateOutsideComponent } from 'configs/i18n';
import { ExamLanguage, ExamLevel } from 'enums/app';
import { ExamSession, ExamSessionLocation } from 'interfaces/examSessions';

export class ExamUtils {
  static languageAndLevelText({
    language_code,
    level_code,
  }: {
    language_code: ExamLanguage;
    level_code: ExamLevel;
  }) {
    const t = translateOutsideComponent();

    return `${t('yki.common.languages.' + language_code)}, ${t(
      'yki.common.languageLevel.' + level_code
    )}`;
  }

  static getLocationInfo(es: ExamSession, lang: AppLanguage) {
    const locationData = es.location.find(
      (esl) =>
        (lang === AppLanguage.Finnish && esl.lang === 'fi') ||
        (lang === AppLanguage.Swedish && esl.lang === 'sv') ||
        (lang === AppLanguage.English && esl.lang === 'en')
    );

    return locationData as ExamSessionLocation;
  }

  static renderDateTime(dateTime?: Dayjs) {
    const t = translateOutsideComponent();

    return DateUtils.formatOptionalDateTime(
      dateTime,
      t('yki.common.dates.dateTimeFormat')
    );
  }
}
