import { H2, Text } from 'shared/components';
import { DateUtils } from 'shared/utils';

import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PublicPerson } from 'interfaces/publicPerson';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';

export const PersonDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.personDetails',
  });

  const { person } = useAppSelector(publicEnrollmentSelector);

  if (!person) {
    return null;
  }

  const displayField = (field: keyof PublicPerson) => {
    const value =
      field === 'dateOfBirth'
        ? DateUtils.formatOptionalDate(person.dateOfBirth)
        : person[field];

    return (
      <div className="rows">
        <Text className="bold">
          {t(field)}
          {':'}
        </Text>
        <Text>{value}</Text>
      </div>
    );
  };

  return (
    <div className="rows gapped">
      <H2>{t('title')}</H2>
      <div className="grid-columns gapped">
        {displayField('lastName')}
        {displayField('firstName')}
        {person.identityNumber && displayField('identityNumber')}
        {person.dateOfBirth && displayField('dateOfBirth')}
      </div>
    </div>
  );
};
