import { CustomTextField, H3 } from 'shared/components';
import { DateUtils } from 'shared/utils';

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
        {person.lastName && (
          <CustomTextField
            label={t('lastName')}
            value={person.lastName}
            disabled
          />
        )}
        {person.firstName && (
          <CustomTextField
            label={t('firstName')}
            value={person.firstName}
            disabled
          />
        )}
        {person.identityNumber && (
          <CustomTextField
            label={t('identityNumber')}
            value={person.identityNumber}
            disabled
          />
        )}
        {person.dateOfBirth && (
          <CustomTextField
            label={t('dateOfBirth')}
            value={DateUtils.formatOptionalDate(person.dateOfBirth)}
            disabled
          />
        )}
      </div>
    </div>
  );
};
