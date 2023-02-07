import { Dayjs } from 'dayjs';
import { AppLanguage } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { translateOutsideComponent } from 'configs/i18n';
import { ExamSession, ExamSessionLocation } from 'interfaces/examSessions';

export class ExamUtils {
  static renderLanguageAndLevel(es: ExamSession) {
    const t = translateOutsideComponent();

    return `${t('yki.common.languages.' + es.language_code)}, ${t(
      'yki.common.languageLevel.' + es.level_code
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
