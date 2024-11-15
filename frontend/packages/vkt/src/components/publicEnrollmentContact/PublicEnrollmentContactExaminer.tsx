import { Fragment } from 'react';
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
        <b>
          {examiner.municipalities
            .map(({ fi, sv }) =>
              appLanguage === AppLanguage.Swedish ? sv : fi,
            )
            .join(', ')}
        </b>
      </Text>
      <Text>
        Tutkintopäivä
        {': '}
        <b>
          {examiner.examDates.map((v, i) => (
            <Fragment key={i}>
              {i > 0 ? <br /> : undefined}
              {DateTimeUtils.renderDate(v.examDate)}
            </Fragment>
          ))}
        </b>
      </Text>
    </div>
  );
};
