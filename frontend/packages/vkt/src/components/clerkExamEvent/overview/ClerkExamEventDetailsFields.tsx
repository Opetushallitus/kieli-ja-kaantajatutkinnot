import dayjs, { Dayjs } from 'dayjs';
import { ChangeEvent } from 'react';
import {
  AutocompleteValue,
  ComboBox,
  CustomDatePicker,
  CustomSwitch,
  H3,
} from 'shared/components';
import { TextFieldVariant } from 'shared/enums';
import { ComboBoxOption } from 'shared/interfaces';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { ExamLanguage, ExamLevel } from 'enums/app';
import {
  ClerkExamEvent,
  ClerkExamEventBasicInformation,
} from 'interfaces/clerkExamEvent';

export const ClerkExamEventDetailsFields = ({
  examEvent,
  editDisabled,
  onComboBoxChange,
  onDateChange,
  onCheckBoxChange,
}: {
  examEvent?: ClerkExamEvent;
  editDisabled: boolean;
  onComboBoxChange: (
    field: keyof ClerkExamEventBasicInformation
  ) => ({}, autocompleteValue?: AutocompleteValue) => void;
  onDateChange: (
    field: keyof Pick<
      ClerkExamEventBasicInformation,
      'date' | 'registrationCloses'
    >
  ) => (date: Dayjs | null) => void;
  onCheckBoxChange: (
    field: keyof ClerkExamEventBasicInformation
  ) => (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}) => {
  // I18n
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventOverview.examEventDetailsFields',
  });
  const translateCommon = useCommonTranslation();

  const examLevelToLabel = (level: string): ComboBoxOption => {
    return {
      label: translateCommon(`examLevel.${level}`),
      value: level,
    };
  };

  const languageCodeToLabel = (code: string) => {
    const label = translateCommon(`examLanguage.${code}`);

    return {
      label: label,
      value: code,
    };
  };

  return (
    <>
      <div className="clerk-exam-event-details margin-top-lg columns gapped">
        <div className="rows gapped">
          <H3>{t('header.language')}</H3>
          <ComboBox
            data-testid="clerk-exam-event__basic-information__language"
            autoHighlight
            disabled={editDisabled}
            variant={TextFieldVariant.Outlined}
            values={Object.keys(ExamLanguage)
              .filter((l) => l !== ExamLanguage.ALL)
              .map(languageCodeToLabel)}
            value={
              examEvent?.language
                ? languageCodeToLabel(examEvent.language)
                : null
            }
            onChange={onComboBoxChange('language')}
          />
        </div>
        <div className="rows gapped">
          <H3>{t('header.level')}</H3>
          <ComboBox
            data-testid="clerk-exam-event__basic-information__level"
            autoHighlight
            disabled={editDisabled}
            variant={TextFieldVariant.Outlined}
            values={Object.keys(ExamLevel).map(examLevelToLabel)}
            value={examEvent?.level ? examLevelToLabel(examEvent.level) : null}
            onChange={onComboBoxChange('level')}
          />
        </div>
        <div
          className="rows gapped"
          data-testid="clerk-exam-event__basic-information__date"
        >
          <H3>{t('header.date')}</H3>
          <CustomDatePicker
            value={dayjs(examEvent?.date) ?? null}
            setValue={onDateChange('date')}
            disabled={editDisabled}
          />
        </div>
        <div
          className="rows gapped"
          data-testid="clerk-exam-event__basic-information__registrationCloses"
        >
          <H3>{t('header.registrationCloses')}</H3>
          <CustomDatePicker
            value={dayjs(examEvent?.registrationCloses) ?? null}
            setValue={onDateChange('registrationCloses')}
            disabled={editDisabled}
          />
        </div>
        <div className="rows gapped">
          <H3>{t('header.isHidden')}</H3>
          <CustomSwitch
            dataTestId="clerk-exam-event__basic-information__is-hidden-switch"
            disabled={editDisabled}
            onChange={onCheckBoxChange('isHidden')}
            value={examEvent?.isHidden}
            leftLabel={translateCommon('no')}
            rightLabel={translateCommon('yes')}
          />
        </div>
      </div>
    </>
  );
};
