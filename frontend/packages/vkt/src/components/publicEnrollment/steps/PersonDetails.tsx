import { H2, Text } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PublicPerson } from 'interfaces/publicPerson';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';

export const PersonDetails = ({
  isPreviewStep,
}: {
  isPreviewStep: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.personDetails',
  });

  const { person } = useAppSelector(publicEnrollmentSelector);

  if (!person) {
    return null;
  }

  const displayField = (field: keyof PublicPerson) => (
    <div className="rows">
      <Text className="bold">
        {t(field)}
        {':'}
      </Text>
      <Text>{person[field]}</Text>
    </div>
  );

  return (
    <div className="rows gapped">
      <H2>{t('title')}</H2>
      <div
        className={
          'gapped ' + isPreviewStep ? 'grid-3-columns' : 'grid-columns'
        }
        data-testid="enrollment-person-details"
      >
        {displayField('lastName')}
        {displayField('firstName')}
      </div>
    </div>
  );
};
