import dayjs, { Dayjs } from 'dayjs';
import { CustomDatePicker, H3 } from 'shared/components';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { DraftClerkExamEvent } from 'interfaces/clerkExamEvent';
import { updateClerkNewExamDate } from 'redux/reducers/clerkNewExamDate';

export const ClerkExamRegistrationCloses = ({
  examForm,
}: {
  examForm: DraftClerkExamEvent;
}) => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventListing',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();

  const onRegistrationClosesChange = (value: Dayjs | null) => {
    const examFormDetails: DraftClerkExamEvent = {
      ...examForm,
      registrationCloses: value ?? undefined,
    };
    dispatch(updateClerkNewExamDate(examFormDetails));
  };

  return (
    <div
      className="rows gapped"
      data-testid="clerk-exam__event-information__registration"
    >
      <H3>{t('header.registrationCloses')}</H3>
      <CustomDatePicker
        minDate={dayjs()}
        maxDate={examForm.date?.subtract(1, 'd')}
        setValue={onRegistrationClosesChange}
        label={translateCommon('choose')}
        value={examForm?.registrationCloses ?? null}
      />
    </div>
  );
};
