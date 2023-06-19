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
    return isEnrollmentToQueue
      ? `${t('openings')}: ${Math.max(examEvent.openings, 0)} ${t(
          'enrollmentToQueue'
        )})`
      : `${t('openings')}: ${Math.max(examEvent.openings, 0)}`;
  };

  return (
    <div className="rows-gapped-xxs">
      <Text>
        {ExamEventUtils.languageAndLevelText(
          examEvent.language,
          ExamLevel.EXCELLENT,
          translateCommon
        )}
      </Text>
      <Text>{`${t('examDate')}: ${DateUtils.formatOptionalDate(
        examEvent.date
      )}`}</Text>
      <Text>{`${t('registrationCloses')}: ${DateUtils.formatOptionalDate(
        examEvent.registrationCloses
      )}`}</Text>
      {showOpenings && <Text>{getOpeningsText()}</Text>}
    </div>
  );
};
