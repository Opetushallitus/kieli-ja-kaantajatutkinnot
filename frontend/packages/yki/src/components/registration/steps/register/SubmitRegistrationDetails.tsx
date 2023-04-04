import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link } from '@mui/material';
import { H2, Text } from 'shared/components';

import { CommonRegistrationDetails } from 'components/registration/steps/register/CommonRegistrationDetails';
import { EmailRegistrationDetails } from 'components/registration/steps/register/EmailRegistrationDetails';
import { SuomiFiRegistrationDetails } from 'components/registration/steps/register/SuomiFiRegistrationDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { registrationSelector } from 'redux/selectors/registration';

export const SubmitRegistrationDetails = () => {
  const { isEmailRegistration } = useAppSelector(registrationSelector);
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails',
  });

  return (
    <div className="margin-top-xxl rows gapped">
      <H2>{t('title')}</H2>
      <Text>
        {t('description1')}
        <br />
        {t('description2')}
      </Text>
      {isEmailRegistration ? (
        <EmailRegistrationDetails />
      ) : (
        <SuomiFiRegistrationDetails />
      )}
      <CommonRegistrationDetails />
      <H2>{t('whatsNext.title')}</H2>
      <Text>{t('whatsNext.description1')}</Text>
      <Text>
        {t('whatsNext.description2')}
        <br />
        {t('whatsNext.description3')}:
        <br />
        <div className="columns gapped-xxs">
          <Link
            href={translateCommon('specialArrangementsLink')}
            target="_blank"
          >
            {t('whatsNext.linkLabel')}
          </Link>
          <OpenInNewIcon />
        </div>
      </Text>
    </div>
  );
};
