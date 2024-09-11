import dayjs, { Dayjs } from 'dayjs';
import { CustomDatePicker, H3, Text } from 'shared/components';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { DraftClerkExamEvent } from 'interfaces/clerkExamEvent';
import { updateClerkNewExamDate } from 'redux/reducers/clerkNewExamDate';

export const ClerkExamRegistrationOpens = ({
  examForm,
}: {
  examForm: DraftClerkExamEvent;
}) => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventListing',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();

  const onRegistrationOpensChange = (value: Dayjs | null) => {
    const examFormDetails: DraftClerkExamEvent = {
      ...examForm,
      registrationOpens: value?.hour(10).minute(0) ?? undefined,
    };
    dispatch(updateClerkNewExamDate(examFormDetails));
  };

  return (
    <div
      className="rows gapped"
      data-testid="clerk-exam__event-information__registration-opens"
    >
      <H3>{t('header.registrationOpens')}</H3>
      <div className="columns gapped-xs">
        <CustomDatePicker
          minDate={dayjs()}
          maxDate={examForm.registrationCloses}
          setValue={onRegistrationOpensChange}
          label={translateCommon('choose')}
          value={examForm?.registrationOpens ?? null}
        />
        <Text>{translateCommon('dates.registrationOpensAt')}</Text>
      </div>
    </div>
  );
};
