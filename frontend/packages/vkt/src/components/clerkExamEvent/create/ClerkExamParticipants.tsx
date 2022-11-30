import { ComboBox, H3 } from 'shared/components';
import { TextFieldVariant } from 'shared/enums';
import { AutocompleteValue } from 'shared/interfaces';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { DraftClerkExamEvent } from 'interfaces/clerkExamEvent';
import { updateClerkNewExamDate } from 'redux/reducers/clerkNewExamDate';
import { ExamCreateEventUtils } from 'utils/examCreateEvent';

const maxParticipantsOpts = ExamCreateEventUtils.maxParticipantsOpts();

export const ClerkExamParticipants = ({
  examForm,
}: {
  examForm: DraftClerkExamEvent;
}) => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventListing',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();

  const onParticipantsChange = ({}, num: AutocompleteValue) => {
    const examFormDetails: DraftClerkExamEvent = {
      ...examForm,
      maxParticipants: Number(num?.value),
    };
    dispatch(updateClerkNewExamDate(examFormDetails));
  };

  return (
    <div className="rows gapped">
      <H3>{t('header.fillingsTotal')}</H3>
      <ComboBox
        data-testid="clerk-exam__event-information__max-participants"
        autoHighlight
        label={translateCommon('choose')}
        onChange={onParticipantsChange}
        variant={TextFieldVariant.Outlined}
        values={maxParticipantsOpts}
        value={ExamCreateEventUtils.getParticipantsComboOpt(examForm)}
      />
    </div>
  );
};
