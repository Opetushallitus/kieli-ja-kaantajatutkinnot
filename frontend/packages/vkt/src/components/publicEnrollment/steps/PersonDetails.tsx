import { CustomTextField, H3 } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';

export const PersonDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.personDetails',
  });

  const { reservationDetails } = useAppSelector(publicEnrollmentSelector);
  const person = reservationDetails?.person;

  if (!person) {
    return null;
  }

  return (
    <div className="rows gapped">
      <H3>{t('title')}</H3>
      <div className="grid-columns gapped">
        <CustomTextField
          label={t('lastName')}
          value={person.lastName}
          disabled
        />
        <CustomTextField
          label={t('firstName')}
          value={person.firstName}
          disabled
        />
        <CustomTextField
          label={t('identityNumber')}
          value={person.identityNumber}
          disabled
        />
      </div>
    </div>
  );
};
