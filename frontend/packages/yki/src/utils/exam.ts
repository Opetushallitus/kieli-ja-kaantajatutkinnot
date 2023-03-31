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

  static isRegistrationOpen(examSession: ExamSession, now: Dayjs) {
    const { registration_start_date, registration_end_date } = examSession;

    if (!registration_start_date || !registration_end_date) {
      return false;
    }

    // TODO Consider timezones! Registration opening / closing times are supposed to be
    // wrt. Finnish times, but user can be on a different timezone.
    const registrationOpensAt = registration_start_date.hour(10);
    const registrationClosesAt = registration_end_date.hour(16);

    return (
      registrationOpensAt.isBefore(now) && registrationClosesAt.isAfter(now)
    );
  }

  static isPostAdmissionOpen(examSession: ExamSession, now: Dayjs) {
    const {
      post_admission_active,
      post_admission_start_date,
      post_admission_end_date,
    } = examSession;

    if (
      !post_admission_active ||
      !post_admission_start_date ||
      !post_admission_end_date
    ) {
      return false;
    }

    const postAdmissionOpensAt = post_admission_start_date.hour(10);
    const postAdmissionClosesAt = post_admission_end_date.hour(16);

    return (
      postAdmissionOpensAt.isBefore(now) && postAdmissionClosesAt.isAfter(now)
    );
  }
}
