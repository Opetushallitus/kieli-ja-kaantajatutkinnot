import { ChangeEvent, useState } from 'react';
import { CustomTextField, H3 } from 'shared/components';
import { TextFieldTypes, TextFieldVariant } from 'shared/enums';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { DraftClerkExamEvent } from 'interfaces/clerkExamEvent';
import { updateClerkNewExamDate } from 'redux/reducers/clerkNewExamDate';
import { ExamCreateEventUtils } from 'utils/examCreateEvent';

export const ClerkExamMaxParticipants = ({
  examForm,
}: {
  examForm: DraftClerkExamEvent;
}) => {
  const [isDirty, setDirty] = useState(false);
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventCreate',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();

  const onParticipantsChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = Number(event.target.value);

    const examFormDetails: DraftClerkExamEvent = {
      ...examForm,
      maxParticipants:
        isNaN(value) || event.target.value === '' ? undefined : value,
    };
    dispatch(updateClerkNewExamDate(examFormDetails));
  };

  const getErrorText = (value: number | undefined): string => {
    return value === undefined
      ? translateCommon('errors.customTextField.required')
      : translateCommon('errors.customTextField.numberFormat');
  };

  const showError = ExamCreateEventUtils.participantsHasError(
    isDirty,
    examForm.maxParticipants
  );

  return (
    <div className="rows gapped">
      <H3>{t('fillingsTotal')}</H3>
      <CustomTextField
        className="clerk-exam-create-max-participants"
        label={translateCommon('choose')}
        type={TextFieldTypes.Number}
        value={examForm.maxParticipants ?? ''}
        error={showError}
        showHelperText={showError}
        helperText={getErrorText(examForm.maxParticipants)}
        variant={TextFieldVariant.Outlined}
        onChange={onParticipantsChange}
        onBlur={() => setDirty(true)}
        data-testid="clerk-exam__event-information__max-participants"
      />
    </div>
  );
};
