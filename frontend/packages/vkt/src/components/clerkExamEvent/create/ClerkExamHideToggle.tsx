import { CustomSwitch, H3 } from 'shared/components';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { DraftClerkExamEvent } from 'interfaces/clerkExamEvent';
import { updateClerkNewExamDate } from 'redux/reducers/clerkNewExamDate';

export const ClerkExamHideToggle = ({
  examForm,
}: {
  examForm: DraftClerkExamEvent;
}) => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventListing',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();

  const onIsHiddenChange = ({}, checked: boolean) => {
    const examFormDetails: DraftClerkExamEvent = {
      ...examForm,
      isHidden: checked,
    };
    dispatch(updateClerkNewExamDate(examFormDetails));
  };

  return (
    <div className="rows gapped">
      <H3>{t('header.hidden')}</H3>
      <CustomSwitch
        dataTestId="clerk-exam__event-information__show-public-dates"
        leftLabel={translateCommon('no')}
        rightLabel={translateCommon('yes')}
        onChange={onIsHiddenChange}
        value={examForm?.isHidden ?? false}
      />
    </div>
  );
};
