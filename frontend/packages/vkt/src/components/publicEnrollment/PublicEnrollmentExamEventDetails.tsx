import { Text } from 'shared/components';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { ExamLevel } from 'enums/app';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { DateTimeUtils } from 'utils/dateTime';
import { ExamEventUtils } from 'utils/examEvent';

export const PublicEnrollmentExamEventDetails = ({
  examEvent,
  showOpenings,
  isEnrollmentToQueue,
}: {
  examEvent: PublicExamEvent;
  showOpenings: boolean;
  isEnrollmentToQueue: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.examEventDetails',
  });
  const translateCommon = useCommonTranslation();

  const getOpeningsText = () => {
    return !isEnrollmentToQueue
      ? `${Math.max(examEvent.openings, 0)}`
      : `${Math.max(examEvent.openings, 0)} (${t('enrollmentToQueue')})`;
  };

  return (
    <div className="rows-gapped-xxs" data-testid="enrollment-details">
      <Text>
        {t('examEvent')}
        {': '}
        <b>
          {ExamEventUtils.languageAndLevelText(
            examEvent.language,
            ExamLevel.EXCELLENT,
            translateCommon,
          )}
        </b>
      </Text>
      <Text>
        {t('examDate')}
        {': '}
        <b>{DateTimeUtils.renderDate(examEvent.date)}</b>
      </Text>
      <Text>
        {t('registrationCloses')}
        {': '}
        <b>{DateTimeUtils.renderCloseDateTime(examEvent.registrationCloses)}</b>
      </Text>
      {showOpenings && (
        <Text>
          {t('openings')}
          {': '}
          <b>{getOpeningsText()}</b>
        </Text>
      )}
    </div>
  );
};
