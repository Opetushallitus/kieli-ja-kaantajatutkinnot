import { Text } from 'shared/components';

import {
  useCommonTranslation,
  useKoodistoMunicipalitiesTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { ExamLevel } from 'enums/app';
import { PublicExaminerExamEvent } from 'interfaces/publicExaminerExamEvent';
import { DateTimeUtils } from 'utils/dateTime';
import { ExamEventUtils } from 'utils/examEvent';

export const PublicEnrollmentAppointmentExamEvent = ({
  examEvent,
}: {
  examEvent: Pick<
    PublicExaminerExamEvent,
    'language' | 'date' | 'examTime' | 'municipality' | 'location' | 'examiner'
  >;
}) => {
  const examiner = examEvent.examiner;
  const translateCommon = useCommonTranslation();
  const translateMunicipality = useKoodistoMunicipalitiesTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentAppointment.examEventDetails',
  });
  const examTime = DateTimeUtils.parseTime(examEvent.examTime);

  return (
    <div className="rows">
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
        {t('examiner')}
        {': '}
        <b>{examiner.name}</b>
      </Text>
      <Text>
        {t('examDate')}
        {': '}
        <b>
          <b>{DateTimeUtils.renderDate(examEvent.date)}</b>
        </b>
      </Text>
      <Text>
        {t('municipality')}
        {': '}
        <b>{translateMunicipality(examEvent.municipality.code)}</b>
      </Text>
      <Text>
        {t('examLocation')}
        {': '}
        <b>{examEvent.location}</b>
      </Text>
      <Text>
        {t('examTime')}
        {': '}
        <b>{DateTimeUtils.renderTime(examTime)}</b>
      </Text>
    </div>
  );
};
