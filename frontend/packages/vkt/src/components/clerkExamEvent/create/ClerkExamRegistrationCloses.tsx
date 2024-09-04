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
    keyPrefix: 'vkt.component.clerkExamEventOverview.examEventDetailsFields',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();

  const onRegistrationClosesChange = (value: Dayjs | null) => {
    const examFormDetails: DraftClerkExamEvent = {
      ...examForm,
      registrationCloses: value?.hour(16).minute(0) ?? undefined,
    };
    dispatch(updateClerkNewExamDate(examFormDetails));
  };

  return (
    <div
      className="rows gapped"
      data-testid="clerk-exam__event-information__registration-closes"
    >
      <H3>{t('registrationCloses')}</H3>
      <div>
        <CustomDatePicker
          minDate={examForm.registrationOpens ?? dayjs()}
          maxDate={examForm.date?.subtract(1, 'd')}
          setValue={onRegistrationClosesChange}
          label={translateCommon('choose')}
          value={examForm.registrationCloses ?? null}
        />
        {t('registrationClosesTime')}
      </div>
    </div>
  );
};
