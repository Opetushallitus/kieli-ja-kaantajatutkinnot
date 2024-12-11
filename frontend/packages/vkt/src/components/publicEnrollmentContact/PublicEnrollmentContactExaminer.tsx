import { Text } from 'shared/components';
import { AppLanguage } from 'shared/enums';

import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
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
  const appLanguage = getCurrentLang();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentContact.examinerDetails',
  });

  const { language, name, municipalities, examDates } = examiner;

  return (
    <div className="rows">
      <Text>
        {t('examEvent')}
        {': '}
        <b>
          {ExamEventUtils.languageAndLevelText(
            language,
            ExamLevel.GOOD_AND_SATISFACTORY,
            translateCommon,
          )}
        </b>
      </Text>
      <Text>
        {t('examiner')}
        {': '}
        <b>{name}</b>
      </Text>
      <Text>
        {t('municipality')}
        {': '}
        <b>
          {municipalities
            .map(({ fi, sv }) =>
              appLanguage === AppLanguage.Swedish ? sv : fi,
            )
            .join(', ')}
        </b>
      </Text>
      <div className="columns gapped-xxs align-items-start">
        <Text>{t('examDate')}:</Text>
        <Text>
          <ul className="public-enrollment-contact__exam-dates">
            {examDates.length > 0
              ? examDates.map(({ examDate, isFull }, i) => (
                  <li key={i}>
                    {isFull ? (
                      <b>
                        <s>{DateTimeUtils.renderDate(examDate)}</s> {t('full')}
                      </b>
                    ) : (
                      <b>{DateTimeUtils.renderDate(examDate)}</b>
                    )}
                  </li>
                ))
              : t('byRequest')}
          </ul>
        </Text>
      </div>
    </div>
  );
};
