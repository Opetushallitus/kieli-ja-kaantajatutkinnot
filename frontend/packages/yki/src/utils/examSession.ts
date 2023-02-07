import { ExamLanguage, ExamLevel } from 'enums/app';

export class ExamSessionUtils {
  static languageAndLevelText(
    language: ExamLanguage,
    level: ExamLevel,
    translateCommon: (t: string) => string
  ) {
    const langTranslation = translateCommon(`languages.${language}`);
    const levelTranslation = translateCommon(
      `languageLevel.${ExamLevel[level]}`
    );

    return `${langTranslation}, ${levelTranslation}`;
  }
}
