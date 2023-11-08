import dayjs, { Dayjs } from 'dayjs';
import { AppLanguage } from 'shared/enums';
import { StringUtils } from 'shared/utils';

import { translateOutsideComponent } from 'configs/i18n';
import { ExamLanguage, ExamLevel, RegistrationKind } from 'enums/app';
import { ExamSession, ExamSessionLocation } from 'interfaces/examSessions';
import { DateTimeUtils } from 'utils/dateTime';

export class ExamSessionUtils {
  private static getRegistrationAvailablePlaces(examSession: ExamSession) {
    return Math.max(examSession.max_participants - examSession.participants, 0);
  }

  private static isPostAdmissionAvailable(examSession: ExamSession) {
    return (
      examSession.post_admission_active &&
      examSession.post_admission_start_date &&
      examSession.post_admission_end_date
    );
  }

  private static getPostAdmissionAvailablePlaces(examSession: ExamSession) {
    if (
      ExamSessionUtils.isPostAdmissionAvailable(examSession) &&
      !ExamSessionUtils.hasPostAdmissionEnded(examSession, dayjs()) &&
      examSession.post_admission_quota
    ) {
      return Math.max(
        examSession.post_admission_quota - examSession.pa_participants,
        0,
      );
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

  private static compareExamSessionsByAdmissionAvailability(
    es1: ExamSession,
    es2: ExamSession,
  ) {
    if (es1.open && !es2.open) {
      return -1;
    } else if (!es1.open && es2.open) {
      return 1;
    } else {
      return 0;
    }
  }

  private static compareExamSessionsByLang(es1: ExamSession, es2: ExamSession) {
    // Note: this is a silly comparison of language codes.
    // Use when the actual order between exam languages is not a major concern,
    // but exam sessions should just be grouped by language.
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

    return 0;
  }

  private static compareExamSessionsByQueueFullness(
    es1: ExamSession,
    es2: ExamSession,
  ) {
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
    es2: ExamSession,
  ) {
    const now = dayjs();

    const registrationEnded1 =
      ExamSessionUtils.hasRegistrationEnded(es1, now) &&
      (!ExamSessionUtils.isPostAdmissionAvailable(es1) ||
        ExamSessionUtils.hasPostAdmissionEnded(es1, now));

    const registrationEnded2 =
      ExamSessionUtils.hasRegistrationEnded(es2, now) &&
      (!ExamSessionUtils.isPostAdmissionAvailable(es2) ||
        ExamSessionUtils.hasPostAdmissionEnded(es2, now));

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
      ExamSessionUtils.compareExamSessionsByAdmissionAvailability,
      ExamSessionUtils.compareExamSessionsByRoom,
      ExamSessionUtils.compareExamSessionsByQueueFullness,
      ExamSessionUtils.compareExamSessionsByRegistrationEnding,
      ExamSessionUtils.compareExamSessionsByDate,
      ExamSessionUtils.compareExamSessionsByLang,
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
      'yki.common.languageLevel.' + level_code,
    )}`;
  }

  static getLocationInfo(es: ExamSession, lang: AppLanguage) {
    const locationData = es.location.find(
      (esl) =>
        (lang === AppLanguage.Finnish && esl.lang === 'fi') ||
        (lang === AppLanguage.Swedish && esl.lang === 'sv') ||
        (lang === AppLanguage.English && esl.lang === 'en'),
    );

    return locationData as ExamSessionLocation;
  }

  static hasRegistrationStarted(examSession: ExamSession, now: Dayjs) {
    const { registration_start_date } = examSession;

    return DateTimeUtils.isBeforeOrEqual(registration_start_date, now);
  }

  static hasRegistrationEnded(examSession: ExamSession, now: Dayjs) {
    const { registration_end_date } = examSession;

    return DateTimeUtils.isBeforeOrEqual(registration_end_date, now);
  }

  static hasPostAdmissionStarted(examSession: ExamSession, now: Dayjs) {
    const { post_admission_start_date } = examSession;

    return (
      post_admission_start_date &&
      DateTimeUtils.isBeforeOrEqual(post_admission_start_date, now)
    );
  }

  static hasPostAdmissionEnded(examSession: ExamSession, now: Dayjs) {
    const { post_admission_end_date } = examSession;

    return (
      post_admission_end_date &&
      DateTimeUtils.isBeforeOrEqual(post_admission_end_date, now)
    );
  }

  static getEffectiveRegistrationPeriodDetails(examSession: ExamSession) {
    const now = dayjs();

    if (
      !ExamSessionUtils.hasRegistrationEnded(examSession, now) ||
      !ExamSessionUtils.isPostAdmissionAvailable(examSession)
    ) {
      return {
        kind: RegistrationKind.Admission,
        start: examSession.registration_start_date,
        end: examSession.registration_end_date,
        participants: examSession.participants,
        quota: examSession.max_participants,
        availablePlaces: ExamSessionUtils.getAvailablePlaces(examSession),
        availableQueue: !examSession.queue_full,
        open:
          ExamSessionUtils.hasRegistrationStarted(examSession, now) &&
          !ExamSessionUtils.hasRegistrationEnded(examSession, now),
      };
    } else {
      const quota = examSession.post_admission_quota || 0;
      const start = examSession.post_admission_start_date as Dayjs;
      const end = examSession.post_admission_end_date as Dayjs;

      return {
        kind: RegistrationKind.PostAdmission,
        start,
        end,
        participants: examSession.pa_participants,
        quota,
        availablePlaces: ExamSessionUtils.getAvailablePlaces(examSession),
        availableQueue: false,
        open:
          ExamSessionUtils.hasPostAdmissionStarted(examSession, now) &&
          !ExamSessionUtils.hasPostAdmissionEnded(examSession, now),
      };
    }
  }

  static getMunicipality(location: ExamSessionLocation) {
    return StringUtils.capitalize(
      StringUtils.trimAndLowerCase(location.post_office),
    );
  }
}
