import { H2, Text } from 'shared/components';

import { BoldedTranslationString } from 'components/common/BoldedTranslationString';
import { usePublicTranslation } from 'configs/i18n';

export const ExamFee = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentContact.steps.selectExam.examFee',
  });

  return (
    <div className="public-enrollment-contact__grid__phone-extra-margin rows gapped">
      <H2>{t('title')}</H2>
      <Text>
        <BoldedTranslationString t={t} i18nKey="part1" /> {t('part2')}{' '}
        <BoldedTranslationString t={t} i18nKey="part3" />
      </Text>
      <Text>{t('part4')}</Text>
    </div>
  );
};
