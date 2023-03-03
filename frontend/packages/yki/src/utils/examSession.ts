import { ExamLanguage, ExamLevel } from 'enums/app';

export class ExamSessionUtils {
  static languageAndLevelText(
    {
      language_code,
      level_code,
    }: { language_code: ExamLanguage; level_code: ExamLevel },
    translateCommon: (t: string) => string
  ) {
    const langTranslation = translateCommon(`languages.${language_code}`);
    const levelTranslation = translateCommon(
      `languageLevel.${ExamLevel[level_code]}`
    );

    return `${langTranslation}, ${levelTranslation}`;
  }
}
