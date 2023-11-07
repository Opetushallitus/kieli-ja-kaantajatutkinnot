import { Text } from 'shared/components';
import { DateUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { ExamLevel } from 'enums/app';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
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
        <b>{DateUtils.formatOptionalDate(examEvent.date, 'l')}</b>
      </Text>
      <Text>
        {t('registrationCloses')}
        {': '}
        <b>{DateUtils.formatOptionalDate(examEvent.registrationCloses, 'l')}</b>
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
