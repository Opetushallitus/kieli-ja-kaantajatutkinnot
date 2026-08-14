import { AppLanguage, I18nNamespace } from 'shared/enums';
import { StringUtils } from 'shared/utils';

import { translateOutsideComponent } from 'configs/i18n';
import { ExamLanguage, ExamLevel } from 'enums/app';
import {
  ExamSession,
  ExamSessionLocation,
  ExamSessionType,
} from 'interfaces/examSessions';
import { PartialExamType } from 'interfaces/publicRegistration';
import { AuthenticatedSession } from 'interfaces/session';
import { PersonRegistrations } from 'interfaces/userDetails';

export class ExamSessionUtils {
  private static getRegistrationAvailablePlaces(
    examSession: ExamSession,
    partialExamType?: PartialExamType,
  ) {
    const readListenAvailablePlaces = Math.max(
      (examSession.max_participants_read_listen ?? 0) -
        (examSession.participants_read_listen ?? 0),
      0,
    );
    const speakWriteAvailablePlaces = Math.max(
      (examSession.max_participants_speak_write ?? 0) -
        (examSession.participants_speak_write ?? 0),
      0,
    );

    if (examSession.type === 'READ_SPEAK') {
      if (partialExamType === 'READ') {
        return examSession.partial_registration_kind.READ === 'ADMISSION'
          ? readListenAvailablePlaces
          : 0;
      }
      if (partialExamType === 'SPEAK') {
        return examSession.partial_registration_kind.SPEAK === 'ADMISSION'
          ? speakWriteAvailablePlaces
          : 0;
      }
      if (partialExamType === 'ALL_PARTS') {
        return examSession.partial_registration_kind.ALL_PARTS === 'ADMISSION'
          ? Math.min(readListenAvailablePlaces, speakWriteAvailablePlaces)
          : 0;
      }
    } else if (examSession.type === 'LISTEN_WRITE') {
      if (partialExamType === 'LISTEN') {
        return examSession.partial_registration_kind.LISTEN === 'ADMISSION'
          ? readListenAvailablePlaces
          : 0;
      }
      if (partialExamType === 'WRITE') {
        return examSession.partial_registration_kind.WRITE === 'ADMISSION'
          ? speakWriteAvailablePlaces
          : 0;
      }
      if (partialExamType === 'ALL_PARTS') {
        return examSession.partial_registration_kind.ALL_PARTS === 'ADMISSION'
          ? Math.min(readListenAvailablePlaces, speakWriteAvailablePlaces)
          : 0;
      }
    }

    return examSession.partial_registration_kind.ALL_PARTS === 'ADMISSION'
      ? Math.max(examSession.max_participants - examSession.participants, 0)
      : 0;
  }

  static getAvailablePlaces(
    examSession: ExamSession,
    partialExamType?: PartialExamType,
  ) {
    if (!examSession.upcoming_admission) {
      return 0;
    } else {
      return ExamSessionUtils.getRegistrationAvailablePlaces(
        examSession,
        partialExamType,
      );
    }
  }

  static hasRoom(examSession: ExamSession, partialExamType?: PartialExamType) {
    return (
      ExamSessionUtils.getAvailablePlaces(examSession, partialExamType) > 0
    );
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

  private static compareExamSessionsByDate(es1: ExamSession, es2: ExamSession) {
    if (es1.session_date.isBefore(es2.session_date)) {
      return -1;
    } else if (es1.session_date.isAfter(es2.session_date)) {
      return 1;
    }

    return 0;
  }

  static compareExamSessions(es1: ExamSession, es2: ExamSession) {
    // Prioritised ordering of comparators
    const comparatorFns = [
      ExamSessionUtils.compareExamSessionsByAdmissionAvailability,
      ExamSessionUtils.compareExamSessionsByRoom,
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

  static getLocationInfo(es: Pick<ExamSession, 'location'>, lang: AppLanguage) {
    const locationData = es.location.find(
      (esl) =>
        (lang === AppLanguage.Finnish && esl.lang === 'fi') ||
        (lang === AppLanguage.Swedish && esl.lang === 'sv') ||
        (lang === AppLanguage.English && esl.lang === 'en'),
    );

    return locationData as ExamSessionLocation;
  }

  static getEffectiveRegistrationPeriodDetails(
    examSession: ExamSession,
    partialExamType?: PartialExamType,
  ) {
    return {
      kind: examSession.available_registration_kind,
      start: examSession.registration_start_date,
      end: examSession.registration_end_date,
      participants: examSession.participants,
      quota: examSession.max_participants,
      availablePlaces: ExamSessionUtils.getAvailablePlaces(
        examSession,
        partialExamType,
      ),
      open: examSession.open,
      queue: examSession.queue,
    };
  }

  static getMunicipality(location: ExamSessionLocation) {
    return StringUtils.capitalize(
      StringUtils.trimAndLowerCase(location.post_office),
    );
  }

  static freeRegistrationPossible(
    { level_code, language_code }: ExamSession,
    authenticatedSession?: AuthenticatedSession,
  ) {
    if (
      authenticatedSession &&
      authenticatedSession['auth-method'] !== 'SUOMIFI'
    ) {
      return false;
    }

    if (level_code !== ExamLevel.YLIN) {
      return false;
    }

    if (
      language_code !== ExamLanguage.FIN &&
      language_code !== ExamLanguage.SWE
    ) {
      return false;
    }

    return true;
  }

  static getPartialExamTypeText(
    examSessionType: ExamSessionType,
    partialExamType?: PartialExamType,
  ) {
    const t = translateOutsideComponent();

    const ns = I18nNamespace.Public;

    if (examSessionType === 'FULL') {
      return t('yki.component.registration.examSessionCard.examType.full', {
        ns,
      });
    }

    if (!partialExamType) {
      return '';
    }

    if (examSessionType === 'LISTEN_WRITE') {
      if (partialExamType === 'ALL_PARTS') {
        return t(
          'yki.component.registration.examSessionCard.examType.listenWrite',
          { ns },
        );
      }
      if (partialExamType === 'LISTEN') {
        return t('yki.component.registration.examSessionCard.examType.listen', {
          ns,
        });
      }
      if (partialExamType === 'WRITE') {
        return t('yki.component.registration.examSessionCard.examType.write', {
          ns,
        });
      }
    }

    if (examSessionType === 'READ_SPEAK') {
      if (partialExamType === 'ALL_PARTS') {
        return t(
          'yki.component.registration.examSessionCard.examType.readSpeak',
          { ns },
        );
      }
      if (partialExamType === 'READ') {
        return t('yki.component.registration.examSessionCard.examType.read', {
          ns,
        });
      }
      if (partialExamType === 'SPEAK') {
        return t('yki.component.registration.examSessionCard.examType.speak', {
          ns,
        });
      }
    }
  }

  static getStartTime(
    examSession: ExamSession,
    partialExamType?: PartialExamType,
  ) {
    if (!partialExamType) {
      return '';
    }

    if (examSession.type === 'LISTEN_WRITE') {
      if (partialExamType === 'LISTEN') {
        return examSession.start_time_read_listen;
      }
      if (partialExamType === 'WRITE') {
        return examSession.start_time_speak_write;
      }

      return examSession.start_time_read_listen;
    }

    if (examSession.type === 'READ_SPEAK') {
      if (partialExamType === 'READ') {
        return examSession.start_time_read_listen;
      }
      if (partialExamType === 'SPEAK') {
        return examSession.start_time_speak_write;
      }

      return examSession.start_time_read_listen;
    }
  }

  static getStartTimeForPersonRegistrations(r: PersonRegistrations) {
    if (!r.partialExamType) {
      return '';
    }

    if (r.type === 'LISTEN_WRITE') {
      if (r.partialExamType === 'LISTEN') {
        return r.start_time_read_listen;
      }
      if (r.partialExamType === 'WRITE') {
        return r.start_time_speak_write;
      }

      return r.start_time_read_listen;
    }

    if (r.type === 'READ_SPEAK') {
      if (r.partialExamType === 'READ') {
        return r.start_time_read_listen;
      }
      if (r.partialExamType === 'SPEAK') {
        return r.start_time_speak_write;
      }

      return r.start_time_read_listen;
    }
  }

  static getPartialExamFee(
    examSession: ExamSession,
    partialExamType?: PartialExamType,
  ) {
    if (examSession.type === 'FULL') {
      return examSession.exam_fee;
    }

    if (!partialExamType) {
      return '';
    }

    if (examSession.type === 'LISTEN_WRITE') {
      if (partialExamType === 'ALL_PARTS') {
        return 113;
      }
      if (partialExamType === 'LISTEN') {
        return 43;
      }
      if (partialExamType === 'WRITE') {
        return 70;
      }
    }

    if (examSession.type === 'READ_SPEAK') {
      if (partialExamType === 'ALL_PARTS') {
        return 127;
      }
      if (partialExamType === 'READ') {
        return 43;
      }
      if (partialExamType === 'SPEAK') {
        return 84;
      }
    }
  }
  static getRegistrationKind({
    examSession,
    partialExamType,
  }: {
    examSession: ExamSession;
    partialExamType?: PartialExamType;
  }) {
    if (!partialExamType) {
      return examSession.available_registration_kind;
    }

    if (examSession.type === 'READ_SPEAK') {
      if (partialExamType === 'READ') {
        return examSession.partial_registration_kind.READ;
      }
      if (partialExamType === 'SPEAK') {
        return examSession.partial_registration_kind.SPEAK;
      }

      return examSession.partial_registration_kind.ALL_PARTS;
    } else if (examSession.type === 'LISTEN_WRITE') {
      if (partialExamType === 'LISTEN') {
        return examSession.partial_registration_kind.LISTEN;
      }
      if (partialExamType === 'WRITE') {
        return examSession.partial_registration_kind.WRITE;
      }

      return examSession.partial_registration_kind.ALL_PARTS;
    }

    return examSession.available_registration_kind;
  }
}
