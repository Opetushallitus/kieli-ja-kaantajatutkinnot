import dayjs, { Dayjs } from 'dayjs';
import { CustomDatePicker, H3 } from 'shared/components';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { DraftClerkExamEvent } from 'interfaces/clerkExamEvent';
import { updateClerkNewExamDate } from 'redux/reducers/clerkNewExamDate';

export const ClerkExamDate = ({
  examForm,
}: {
  examForm: DraftClerkExamEvent;
}) => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventListing',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();

  const onDateChange = (value: Dayjs | null) => {
    const examFormDetails: DraftClerkExamEvent = {
      ...examForm,
      date: value ?? undefined,
    };
    dispatch(updateClerkNewExamDate(examFormDetails));
  };

  return (
    <div
      className="rows gapped"
      data-testid="clerk-exam__event-information__date"
    >
      <H3>{t('header.examDate')}</H3>
      <CustomDatePicker
        minDate={dayjs()}
        setValue={onDateChange}
        label={translateCommon('choose')}
        value={examForm?.date ?? null}
      />
    </div>
  );
};
