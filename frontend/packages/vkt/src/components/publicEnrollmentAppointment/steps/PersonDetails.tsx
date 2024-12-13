import { Divider } from '@mui/material';
import { H2, Text } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { publicEnrollmentAppointmentSelector } from 'redux/selectors/publicEnrollmentAppointment';

export const PersonDetails = ({
  showContactDetails,
}: {
  showContactDetails: boolean;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps',
  });
  const { isPhone } = useWindowProperties();

  const { enrollment } = useAppSelector(publicEnrollmentAppointmentSelector);

  if (!enrollment.person) {
    return null;
  }

  return (
    <div className="rows gapped">
      <H2>{t('personDetails.title')}</H2>
      <div
        className={'gapped grid-columns'}
        data-testid="enrollment-person-details"
      >
        <div className="rows">
          <Text className="bold">
            {t('personDetails.lastName')}
            {':'}
          </Text>
          <Text>{enrollment.person.lastName}</Text>
        </div>
        <div className="rows">
          <Text className="bold">
            {t('personDetails.firstName')}
            {':'}
          </Text>
          <Text>{enrollment.person.firstName}</Text>
        </div>
      </div>
      {isPhone && <Divider />}
      <H2>{t('preview.contactDetails.title')}</H2>
      <div
        className={'gapped grid-columns'}
        data-testid="enrollment-person-details"
      >
        <div className="rows">
          <Text className="bold">
            {t('preview.contactDetails.email')}
            {':'}
          </Text>
          <Text>{enrollment.email}</Text>
        </div>
        <div className="rows">
          <Text className="bold">
            {t('preview.contactDetails.phoneNumber')}
            {':'}
          </Text>
          <Text>{enrollment.phoneNumber}</Text>
        </div>
      </div>
      {showContactDetails && (
        <div
          className={'gapped grid-columns'}
          data-testid="enrollment-person-details"
        >
          <div className="rows">
            <Text className="bold">
              {translateCommon('enrollment.certificateShipping.addressTitle')}
              {':'}
            </Text>
            <Text data-testid="enrollment-preview-certificate-shipping-details">
              {enrollment.street}
              {', '}
              {enrollment.postalCode}
              {', '}
              {enrollment.town}
              {', '}
              {enrollment.country}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};
