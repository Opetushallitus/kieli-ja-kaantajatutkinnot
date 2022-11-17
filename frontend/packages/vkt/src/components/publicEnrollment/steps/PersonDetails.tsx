import { CustomTextField, H3 } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { publicReservationSelector } from 'redux/selectors/publicReservation';

export const PersonDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.personDetails',
  });

  const { reservation } = useAppSelector(publicReservationSelector);
  const person = reservation?.person;

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
