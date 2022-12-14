import { ChangeEvent } from 'react';
import { CustomTextField, H3 } from 'shared/components';
import { TextFieldTypes, TextFieldVariant } from 'shared/enums';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { DraftClerkExamEvent } from 'interfaces/clerkExamEvent';
import { updateClerkNewExamDate } from 'redux/reducers/clerkNewExamDate';

export const ClerkExamParticipants = ({
  examForm,
}: {
  examForm: DraftClerkExamEvent;
}) => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventCreate',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();

  const onParticipantsChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = Number(event.target.value);

    if (value > 0 && value < 999) {
      const examFormDetails: DraftClerkExamEvent = {
        ...examForm,
        maxParticipants: value,
      };
      dispatch(updateClerkNewExamDate(examFormDetails));
    }
  };

  return (
    <div className="rows gapped">
      <H3>{t('fillingsTotal')}</H3>
      <CustomTextField
        className="clerk-exam-create-participants"
        label={translateCommon('choose')}
        type={TextFieldTypes.Number}
        value={examForm.maxParticipants}
        variant={TextFieldVariant.Outlined}
        onChange={onParticipantsChange}
        data-testid="clerk-exam__event-information__max-participants"
      />
    </div>
  );
};
