import { Dayjs } from 'dayjs';
import { ComboBoxOption } from 'shared/interfaces';
import { DateUtils, StringUtils } from 'shared/utils';

import { ExamLanguage, ExamLevel } from 'enums/app';
import { ClerkExamEvent, DraftClerkExamEvent } from 'interfaces/clerkExamEvent';
import { ExamEventUtils } from 'utils/examEvent';

export class ExamCreateEventUtils {
  static maxParticipantsHasError(
    isDirty: boolean,
    value: number | undefined,
  ): boolean {
    return (
      isDirty &&
      (value === undefined || value > 999 || value <= 0 || value % 1 !== 0)
    );
  }

  static isValidExamEvent(examEvent: DraftClerkExamEvent | ClerkExamEvent) {
    return (
      StringUtils.isNonBlankString(examEvent.language) &&
      StringUtils.isNonBlankString(examEvent.level) &&
      DateUtils.isValidDate(examEvent.date) &&
      DateUtils.isValidDate(examEvent.registrationCloses) &&
      DateUtils.isDatePartBefore(
        examEvent.registrationCloses as Dayjs,
        examEvent.date as Dayjs,
      ) &&
      !ExamCreateEventUtils.maxParticipantsHasError(
        true,
        examEvent.maxParticipants,
      )
    );
  }

  static getLangLevelComboOpt(
    examForm: DraftClerkExamEvent,
    translateCommon: (t: string) => string,
  ): ComboBoxOption | null {
    if (!examForm || !examForm.language || !examForm.level) {
      return null;
    }

    return {
      label: ExamEventUtils.languageAndLevelText(
        examForm.language,
        examForm.level,
        translateCommon,
      ),
      value: examForm.language + '-' + examForm.level,
    };
  }

  static langLevelOpts(
    translateCommon: (t: string) => string,
  ): ComboBoxOption[] {
    const langs = Object.keys(ExamLanguage)
      .splice(1)
      .map((lang) => {
        return Object.keys(ExamLevel).map((level) => {
          return {
            label: ExamEventUtils.languageAndLevelText(
              lang as ExamLanguage,
              level as ExamLevel,
              translateCommon,
            ),
            value: lang + '-' + level,
          };
        });
      });

    return langs?.flat() ?? [];
  }
}
