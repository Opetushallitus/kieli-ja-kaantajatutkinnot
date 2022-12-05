import dayjs from 'dayjs';
import { DateUtils } from 'shared/utils';

import { ExamLanguage, ExamLevel } from 'enums/app';
import { ClerkListExamEvent } from 'interfaces/clerkListExamEvent';
export class ExamEventUtils {
  static getUpcomingExamEvents(examEvents: Array<ClerkListExamEvent>) {
    return examEvents.filter(
      (e) => !DateUtils.isDatePartBefore(e.date, dayjs())
    );
  }

  static getPassedExamEvents(examEvents: Array<ClerkListExamEvent>) {
    return examEvents.filter((e) =>
      DateUtils.isDatePartBefore(e.date, dayjs())
    );
  }

  static languageAndLevelText(
    language: ExamLanguage,
    level: ExamLevel,
    translateCommon: (t: string) => string
  ) {
    const langTranslation = translateCommon(`examLanguage.${language}`);
    const levelTranslation = translateCommon(
      `examLevel.${level}`
    ).toLowerCase();

    return `${langTranslation}, ${levelTranslation}`;
  }
}
