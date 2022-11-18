import dayjs from 'dayjs';
import { DateUtils } from 'shared/utils';

import { ExamLanguage, ExamLevel } from 'enums/app';
import { SubExams } from 'interfaces/clerkExamEvent';
import { ClerkListExamEvent } from 'interfaces/clerkListExamEvent';

const examCodes = {
  oralSkill: 'ST',
  readingComprehensionPartialExam: 'TY',
  speakingPartialExam: 'PU',
  speechComprehensionPartialExam: 'PY',
  textualSkill: 'TE',
  understandingSkill: 'YM',
  writingPartialExam: 'KI',
};

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

  static getSubExamCodes(subExams: SubExams) {
    return Object.keys(subExams)
      .filter((key) => subExams[key as keyof typeof subExams])
      .map((key) => examCodes[key as keyof typeof examCodes])
      .join(', ');
  }
}
