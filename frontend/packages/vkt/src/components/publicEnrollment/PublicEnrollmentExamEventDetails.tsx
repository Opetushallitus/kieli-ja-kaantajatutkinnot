import { H2, HeaderSeparator, Text } from 'shared/components';
import { DateUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { ExamLevel } from 'enums/app';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { ExamEventUtils } from 'utils/examEvent';

export const PublicEnrollmentExamEventDetails = ({
  examEvent,
  showOpenings,
}: {
  examEvent: PublicExamEvent;
  showOpenings: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.examEventDetails',
  });
  const translateCommon = useCommonTranslation();

  return (
    <div className="margin-top-xxl rows" data-testid="enrollment-details">
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
        {showOpenings && (
          <Text>{`${t('openings')}: ${Math.max(examEvent.openings, 0)}`}</Text>
        )}
      </div>
    </div>
  );
};
