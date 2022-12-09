import { H2, HeaderSeparator, Text } from 'shared/components';
import { DateUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { ExamLevel } from 'enums/app';
import { publicReservationSelector } from 'redux/selectors/publicReservation';
import { ExamEventUtils } from 'utils/examEvent';

export const PublicEnrollmentReservationDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.reservationDetails',
  });
  const translateCommon = useCommonTranslation();

  const { reservation } = useAppSelector(publicReservationSelector);
  const examEvent = reservation?.examEvent;

  if (!examEvent) {
    return null;
  }

  return (
    <div className="margin-top-xxl rows">
      <div className="rows gapped-xs">
        <H2>
          {ExamEventUtils.languageAndLevelText(
            examEvent.language,
            ExamLevel.EXCELLENT,
            translateCommon
          )}
        </H2>
        <HeaderSeparator />
      </div>
      <div className="rows-gapped-xxs">
        <Text>{`${t('examDate')}: ${DateUtils.formatOptionalDate(
          examEvent.date
        )}`}</Text>
        <Text>{`${t('registrationCloses')}: ${DateUtils.formatOptionalDate(
          examEvent.registrationCloses
        )}`}</Text>
        <Text>{`${t('openings')}: ${Math.max(examEvent.openings, 0)}`}</Text>
      </div>
    </div>
  );
};
