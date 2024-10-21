import { Text } from 'shared/components';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { ExamLevel } from 'enums/app';
import { PublicExaminer } from 'interfaces/publicExaminer';
import { DateTimeUtils } from 'utils/dateTime';
import { ExamEventUtils } from 'utils/examEvent';

export const PublicEnrollmentContactExaminer = ({
  examiner,
}: {
  examiner: PublicExaminer;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.examEventDetails',
  });

  return (
    <div className="rows gapped-xxs">
      <Text>
        {t('examEvent')}
        {': '}
        <b>
          {ExamEventUtils.languageAndLevelText(
            examiner.language,
            ExamLevel.EXCELLENT,
            translateCommon,
          )}
        </b>
      </Text>
      <Text>
        Tutkinnon vastaanottaja
        {': '}
        <b>{examiner.name}</b>
      </Text>
      <Text>
        Tutkintopaikka
        {': '}
        <b>
          {examiner.municipalities.map((location) => (
            <b key={`examiner-location-${location.fi}`}>{location.fi}</b>
          ))}
        </b>
      </Text>
      <Text>
        Tutkintopäivä
        {': '}
        <b>
          {examiner.examDates.map((date) => (
            <b key={`examiner-date-${DateTimeUtils.renderDate(date)}`}>
              {DateTimeUtils.renderDate(date)}
            </b>
          ))}
        </b>
      </Text>
    </div>
  );
};
