import dayjs from 'dayjs';
import { ComboBoxOption } from 'shared/interfaces';

import { ExamLanguage, ExamLevel } from 'enums/app';
import { DraftClerkExamEvent } from 'interfaces/clerkExamEvent';
import { ExamEventUtils } from 'utils/examEvent';

export class ExamCreateEventUtils {
  static participantsHasError(
    isDirty: boolean,
    value: number | undefined
  ): boolean {
    return (
      isDirty &&
      (value === undefined || value > 999 || value <= 0 || value % 1 !== 0)
    );
  }

  static isValidForm(examForm: DraftClerkExamEvent | undefined) {
    if (!examForm) {
      return false;
    }

    if (!examForm.date || !examForm.registrationCloses) {
      return false;
    }

    if (
      examForm.date.isBefore(dayjs()) ||
      examForm.registrationCloses.isBefore(dayjs())
    ) {
      return false;
    }

    if (examForm.date.isBefore(examForm.registrationCloses)) {
      return false;
    }

    if (
      ExamCreateEventUtils.participantsHasError(true, examForm.maxParticipants)
    ) {
      return false;
    }

    if (!examForm.language || !examForm.level) {
      return false;
    }

    return true;
  }

  static getLangLevelComboOpt(
    examForm: DraftClerkExamEvent,
    translateCommon: (t: string) => string
  ): ComboBoxOption | null {
    if (!examForm || !examForm.language || !examForm.level) {
      return null;
    }

    return {
      label: ExamEventUtils.languageAndLevelText(
        examForm.language,
        examForm.level,
        translateCommon
      ),
      value: examForm.language + '-' + examForm.level,
    };
  }

  static langLevelOpts(
    translateCommon: (t: string) => string
  ): ComboBoxOption[] {
    const langs = Object.keys(ExamLanguage)
      .splice(1)
      .map((lang) => {
        return Object.keys(ExamLevel).map((level) => {
          return {
            label: ExamEventUtils.languageAndLevelText(
              lang as ExamLanguage,
              level as ExamLevel,
              translateCommon
            ),
            value: lang + '-' + level,
          };
        });
      });

    return langs?.flat() ?? [];
  }
}
