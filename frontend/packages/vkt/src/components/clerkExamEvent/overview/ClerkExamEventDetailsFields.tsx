import dayjs, { Dayjs } from 'dayjs';
import { ChangeEvent } from 'react';
import {
  ComboBox,
  CustomDatePicker,
  CustomSwitch,
  CustomTextField,
  H3,
} from 'shared/components';
import { TextFieldTypes, TextFieldVariant } from 'shared/enums';
import { ComboBoxOption } from 'shared/interfaces';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { ExamLanguage, ExamLevel } from 'enums/app';
import {
  ClerkExamEvent,
  ClerkExamEventBasicInformation,
} from 'interfaces/clerkExamEvent';
import { DateTimeUtils } from 'utils/dateTime';

export const ClerkExamEventDetailsFields = ({
  examEvent,
  editDisabled,
  onComboBoxChange,
  onDateChange,
  onCheckBoxChange,
  onMaxParticipantsChange,
}: {
  examEvent: ClerkExamEvent;
  editDisabled: boolean;
  onComboBoxChange: (
    field: keyof ClerkExamEventBasicInformation,
  ) => (value?: string) => void;
  onDateChange: (
    field: keyof Pick<
      ClerkExamEventBasicInformation,
      'date' | 'registrationCloses' | 'registrationOpens'
    >,
  ) => (date: Dayjs | null) => void;
  onCheckBoxChange: (
    field: keyof ClerkExamEventBasicInformation,
  ) => (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  onMaxParticipantsChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
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
      <div className="margin-top-lg grid-columns gapped">
        <div className="rows gapped">
          <H3>{t('language')}</H3>
          <ComboBox
            data-testid="clerk-exam-event__basic-information__language"
            autoHighlight
            disabled={editDisabled}
            variant={TextFieldVariant.Outlined}
            values={Object.keys(ExamLanguage)
              .filter((l) => l !== ExamLanguage.ALL)
              .map(languageCodeToLabel)}
            value={
              examEvent.language
                ? languageCodeToLabel(examEvent.language)
                : null
            }
            onChange={onComboBoxChange('language')}
          />
        </div>
        <div className="rows gapped">
          <H3>{t('level')}</H3>
          <ComboBox
            data-testid="clerk-exam-event__basic-information__level"
            autoHighlight
            disabled={editDisabled}
            variant={TextFieldVariant.Outlined}
            values={Object.keys(ExamLevel).map(examLevelToLabel)}
            value={examEvent.level ? examLevelToLabel(examEvent.level) : null}
            onChange={onComboBoxChange('level')}
          />
        </div>
        <div
          className="rows gapped"
          data-testid="clerk-exam-event__basic-information__date"
        >
          <H3>{t('date')}</H3>
          <CustomDatePicker
            value={dayjs(examEvent.date)}
            setValue={onDateChange('date')}
            disabled={editDisabled}
          />
        </div>
      </div>
      <div className="margin-top-lg grid-columns gapped">
        <div
          className="rows gapped"
          data-testid="clerk-exam-event__basic-information__registrationOpens"
        >
          <H3>{t('registrationOpens')}</H3>
          <div>
            <CustomDatePicker
              value={dayjs(examEvent.registrationOpens)}
              setValue={(value: Dayjs | null) =>
                onDateChange('registrationOpens')(
                  value?.hour(10).minute(0) ?? null,
                )
              }
              maxDate={examEvent.registrationCloses}
              disabled={editDisabled}
            />
            {DateTimeUtils.renderTime(examEvent.registrationOpens)}
          </div>
        </div>
        <div
          className="rows gapped"
          data-testid="clerk-exam-event__basic-information__registrationCloses"
        >
          <H3>{t('registrationCloses')}</H3>
          <div>
            <CustomDatePicker
              value={dayjs(examEvent.registrationCloses)}
              setValue={(value: Dayjs | null) =>
                onDateChange('registrationCloses')(
                  value?.hour(16).minute(0) ?? null,
                )
              }
              maxDate={examEvent.date && examEvent.date.subtract(1, 'd')}
              disabled={editDisabled}
            />
            {DateTimeUtils.renderTime(examEvent.registrationCloses)}
          </div>
        </div>
      </div>
      <div className="margin-top-lg grid-columns gapped">
        <div className="rows gapped">
          <H3>{t('fillingsTotal')}</H3>
          <CustomTextField
            data-testid="clerk-exam-event__basic-information__maxParticipants"
            className="clerk-exam-create-max-participants"
            label={translateCommon('choose')}
            type={TextFieldTypes.Number}
            variant={TextFieldVariant.Outlined}
            value={examEvent.maxParticipants}
            onChange={onMaxParticipantsChange}
            disabled={editDisabled}
          />
        </div>
        <div className="rows gapped">
          <H3>{t('isHidden')}</H3>
          <CustomSwitch
            dataTestId="clerk-exam-event__basic-information__is-hidden-switch"
            disabled={editDisabled}
            onChange={onCheckBoxChange('isHidden')}
            value={examEvent.isHidden}
            leftLabel={translateCommon('no')}
            rightLabel={translateCommon('yes')}
          />
        </div>
      </div>
    </>
  );
};
