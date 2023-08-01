import dayjs, { Dayjs } from 'dayjs';
import { AppLanguage } from 'shared/enums';

import { translateOutsideComponent } from 'configs/i18n';
import { ExamLanguage, ExamLevel, RegistrationKind } from 'enums/app';
import { ExamSession, ExamSessionLocation } from 'interfaces/examSessions';

export class ExamSessionUtils {
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

  static isRegistrationOpen(examSession: ExamSession, now: Dayjs) {
    const { registration_start_date, registration_end_date } = examSession;

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
      post_admission_active &&
      post_admission_start_date &&
      post_admission_end_date
    ) {
      const postAdmissionOpensAt = post_admission_start_date.hour(10);
      const postAdmissionClosesAt = post_admission_end_date.hour(16);

      return (
        postAdmissionOpensAt.isBefore(now) && postAdmissionClosesAt.isAfter(now)
      );
    }

    return false;
  }

  static getCurrentOrFutureAdmissionPeriod(examSession: ExamSession) {
    const now = dayjs();
    const registrationOpensAt = examSession.registration_start_date?.hour(10);
    const registrationClosesAt = examSession.registration_end_date?.hour(16);
    const postAdmissionAvailable =
      examSession.post_admission_active &&
      examSession.post_admission_start_date &&
      examSession.post_admission_end_date;
    if (now.isBefore(registrationClosesAt) || !postAdmissionAvailable) {
      return {
        kind: RegistrationKind.Admission,
        start: registrationOpensAt,
        end: registrationClosesAt,
        participants: examSession.participants,
        quota: examSession.max_participants,
        open:
          registrationOpensAt.isBefore(now) &&
          registrationClosesAt.isAfter(now),
      };
    } else {
      const postAdmissionOpensAt = examSession.post_admission_start_date?.hour(
        10
      ) as Dayjs;
      const postAdmissionClosesAt = examSession.post_admission_end_date?.hour(
        16
      ) as Dayjs;

      return {
        kind: RegistrationKind.PostAdmission,
        start: postAdmissionOpensAt,
        end: postAdmissionClosesAt,
        participants: examSession.pa_participants,
        quota: examSession.post_admission_quota,
        open:
          postAdmissionOpensAt.isBefore(now) &&
          postAdmissionClosesAt.isAfter(now),
      };
    }
  }
}
