import dayjs, { Dayjs } from 'dayjs';
import { AppLanguage } from 'shared/enums';

import { translateOutsideComponent } from 'configs/i18n';
import { ExamLanguage, ExamLevel, RegistrationKind } from 'enums/app';
import { ExamSession, ExamSessionLocation } from 'interfaces/examSessions';

export class ExamSessionUtils {
  private static getRegistrationAvailablePlaces(examSession: ExamSession) {
    return examSession.max_participants - examSession.participants;
  }

  private static isPostAdmissionAvailable(examSession: ExamSession) {
    return (
      examSession.post_admission_active &&
      examSession.post_admission_start_date &&
      examSession.post_admission_end_date &&
      examSession.post_admission_quota
    );
  }

  private static getPostAdmissionAvailablePlaces(examSession: ExamSession) {
    if (
      ExamSessionUtils.isPostAdmissionAvailable(examSession) &&
      !ExamSessionUtils.hasPostAdmissionEnded(examSession, dayjs())
    ) {
      return examSession.post_admission_quota - examSession.pa_participants;
    }

    return 0;
  }

  static getAvailablePlaces(examSession: ExamSession) {
    return !ExamSessionUtils.hasRegistrationEnded(examSession, dayjs())
      ? ExamSessionUtils.getRegistrationAvailablePlaces(examSession)
      : ExamSessionUtils.getPostAdmissionAvailablePlaces(examSession);
  }

  static hasRoom(examSession: ExamSession) {
    return ExamSessionUtils.getAvailablePlaces(examSession) > 0;
  }

  private static compareExamSessionsByLang(es1: ExamSession, es2: ExamSession) {
    // TODO: write proper language comparator / re-order ExamLanguage enums
    if (es1.language_code < es2.language_code) {
      return -1;
    } else if (es1.language_code > es2.language_code) {
      return 1;
    }

    return 0;
  }

  private static compareExamSessionsByRoom(es1: ExamSession, es2: ExamSession) {
    const hasRoom1 = ExamSessionUtils.hasRoom(es1);
    const hasRoom2 = ExamSessionUtils.hasRoom(es2);

    if (hasRoom1 && !hasRoom2) {
      return -1;
    } else if (!hasRoom1 && hasRoom2) {
      return 1;
    }

    if (!es1.queue_full && es2.queue_full) {
      return -1;
    } else if (es1.queue_full && !es2.queue_full) {
      return 1;
    }

    return 0;
  }

  private static compareExamSessionsByDate(es1: ExamSession, es2: ExamSession) {
    if (es1.session_date.isBefore(es2.session_date)) {
      return -1;
    } else if (es1.session_date.isAfter(es2.session_date)) {
      return 1;
    }

    return 0;
  }

  private static compareExamSessionsByRegistrationEnding(
    es1: ExamSession,
    es2: ExamSession
  ) {
    const now = dayjs();
    const registrationEnded1 = ExamSessionUtils.hasRegistrationEnded(es1, now);
    const registrationEnded2 = ExamSessionUtils.hasRegistrationEnded(es2, now);

    if (!registrationEnded1 && registrationEnded2) {
      return -1;
    } else if (registrationEnded1 && !registrationEnded2) {
      return 1;
    }

    return 0;
  }

  static compareExamSessions(es1: ExamSession, es2: ExamSession) {
    // Prioritised ordering of comparators
    const comparatorFns = [
      ExamSessionUtils.compareExamSessionsByLang,
      ExamSessionUtils.compareExamSessionsByRoom,
      ExamSessionUtils.compareExamSessionsByDate,
      ExamSessionUtils.compareExamSessionsByRegistrationEnding,
    ];

    for (let i = 0; i < comparatorFns.length; i++) {
      const order = comparatorFns[i](es1, es2);

      if (order !== 0) {
        return order;
      }
    }

    return 0;
  }

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

  static hasRegistrationStarted(examSession: ExamSession, now: Dayjs) {
    const { registration_start_date } = examSession;

    // TODO Consider timezones! Registration opening / closing times are supposed to be
    // wrt. Finnish times, but user can be on a different timezone.
    const registrationOpensAt = registration_start_date.hour(10);

    return registrationOpensAt.isBefore(now);
  }

  static hasRegistrationEnded(examSession: ExamSession, now: Dayjs) {
    const { registration_end_date } = examSession;

    // TODO Consider timezones! Registration opening / closing times are supposed to be
    // wrt. Finnish times, but user can be on a different timezone.
    const registrationClosesAt = registration_end_date.hour(16);

    return registrationClosesAt.isBefore(now);
  }

  static isRegistrationOpen(examSession: ExamSession, now: Dayjs) {
    return (
      ExamSessionUtils.hasRegistrationStarted(examSession, now) &&
      !ExamSessionUtils.hasRegistrationEnded(examSession, now)
    );
  }

  static hasPostAdmissionStarted(examSession: ExamSession, now: Dayjs) {
    if (examSession.post_admission_start_date) {
      const postAdmissionOpensAt =
        examSession.post_admission_start_date.hour(10);

      return postAdmissionOpensAt.isBefore(now);
    }

    return false;
  }

  static hasPostAdmissionEnded(examSession: ExamSession, now: Dayjs) {
    if (examSession.post_admission_end_date) {
      const postAdmissionClosesAt =
        examSession.post_admission_end_date.hour(16);

      return postAdmissionClosesAt.isBefore(now);
    }

    return false;
  }

  static isPostAdmissionOpen(examSession: ExamSession, now: Dayjs) {
    return (
      ExamSessionUtils.isPostAdmissionAvailable(examSession) &&
      ExamSessionUtils.hasPostAdmissionStarted(examSession, now) &&
      !ExamSessionUtils.hasPostAdmissionEnded(examSession, now)
    );
  }

  static getCurrentOrFutureAdmissionPeriod(examSession: ExamSession) {
    const now = dayjs();
    const registrationOpensAt = examSession.registration_start_date?.hour(10);
    const registrationClosesAt = examSession.registration_end_date?.hour(16);

    if (
      !ExamSessionUtils.hasRegistrationEnded(examSession, now) ||
      !ExamSessionUtils.isPostAdmissionAvailable(examSession)
    ) {
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
