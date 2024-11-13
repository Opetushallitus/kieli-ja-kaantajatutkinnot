import { Text } from 'shared/components';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { ExamLevel } from 'enums/app';
import { PublicExaminerExamEvent } from 'interfaces/publicExaminerExamEvent';
import { DateTimeUtils } from 'utils/dateTime';
import { ExamEventUtils } from 'utils/examEvent';

export const PublicEnrollmentAppointmentExamEvent = ({
  examEvent,
}: {
  examEvent: PublicExaminerExamEvent;
}) => {
  const examiner = examEvent.examiner;
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
            examEvent.language,
            ExamLevel.GOOD_AND_SATISFACTORY,
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
        <b>{examEvent.location}</b>
      </Text>
      <Text>
        Tutkintopäivä
        {': '}
        <b>
          <b>{DateTimeUtils.renderDate(examEvent.date)}</b>
        </b>
      </Text>
    </div>
  );
};
