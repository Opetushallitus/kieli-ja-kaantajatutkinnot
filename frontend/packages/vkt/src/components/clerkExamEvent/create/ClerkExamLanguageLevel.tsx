import { useState } from 'react';
import { ComboBox, H3 } from 'shared/components';
import { TextFieldVariant } from 'shared/enums';
import { AutocompleteValue } from 'shared/interfaces';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { ExamLanguage, ExamLevel } from 'enums/app';
import { DraftClerkExamEvent } from 'interfaces/clerkExamEvent';
import { updateClerkNewExamDate } from 'redux/reducers/clerkNewExamDate';
import { ExamCreateEventUtils } from 'utils/examCreateEvent';

const hasError = (
  isDirty: boolean,
  value: ExamLanguage | undefined
): boolean => {
  return isDirty && !value;
};

export const ClerkExamLanguageLevel = ({
  examForm,
}: {
  examForm: DraftClerkExamEvent;
}) => {
  const [isDirty, setDirty] = useState(false);
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventListing',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();

  const onLangLevelChange = ({}, value: AutocompleteValue) => {
    const [language, level] = (value?.value.split('-') as [
      Exclude<ExamLanguage, ExamLanguage.ALL>,
      ExamLevel
    ]) || [undefined, undefined];

    const examFormDetails: DraftClerkExamEvent = {
      ...examForm,
      language,
      level,
    };
    dispatch(updateClerkNewExamDate(examFormDetails));
  };

  const showError = hasError(isDirty, examForm.language);

  return (
    <div className="rows gapped">
      <H3>{t('header.language')}</H3>
      <ComboBox
        data-testid="clerk-exam__event-information__lang-and-level"
        autoHighlight
        showError={showError}
        helperText={translateCommon('errors.customTextField.required')}
        onBlur={() => setDirty(true)}
        label={translateCommon('choose')}
        variant={TextFieldVariant.Outlined}
        values={ExamCreateEventUtils.langLevelOpts(translateCommon)}
        onChange={onLangLevelChange}
        value={ExamCreateEventUtils.getLangLevelComboOpt(
          examForm,
          translateCommon
        )}
      />
    </div>
  );
};
