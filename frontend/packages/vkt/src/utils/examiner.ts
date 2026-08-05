import { ExamLanguage } from 'enums/app';
import { ExaminerDetails } from 'interfaces/examinerDetails';

export class ExaminerUtils {
  static renderExamLanguages(
    examiner: ExaminerDetails,
    translateCommon: (k: string) => string,
  ) {
    const examLanguages: Array<ExamLanguage> = examiner.examLanguageFinnish
      ? examiner.examLanguageSwedish
        ? [ExamLanguage.FI, ExamLanguage.SV]
        : [ExamLanguage.FI]
      : examiner.examLanguageSwedish
        ? [ExamLanguage.SV]
        : [];

    return examLanguages
      .map((v) => translateCommon(`examLanguage.${v}`))
      .join(' & ');
  }

  static renderExamLocations(
    examiner: ExaminerDetails,
    translateMunicipality: (m: string) => string,
  ) {
    return examiner.municipalities
      .map(({ code }) => translateMunicipality(code))
      .sort((a, b) => a.localeCompare(b, 'fi-FI'))
      .join(', ');
  }
}
