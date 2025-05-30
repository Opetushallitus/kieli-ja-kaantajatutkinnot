import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Trans } from 'react-i18next';
import { H2, Text, WebLink } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';

export const ConfirmRegistration = () => {
  const { t } = usePublicTranslation({
    keyPrefix:
      'yki.component.registration.registrationFormSubmitted.proceedToPayment',
  });

  return (
    <div className="margin-top-xxl rows gapped">
      <H2>{t('title')}</H2>
      <Text>
        {t('verifyRegistrationDetails.text1')}{' '}
        {t('verifyRegistrationDetails.text2')}{' '}
        {t('verifyRegistrationDetails.text3')}{' '}
        <WebLink
          startIcon={<OpenInNewIcon />}
          href={t('verifyRegistrationDetails.termsAndConditions.url')}
          label={t('verifyRegistrationDetails.termsAndConditions.label')}
        />
      </Text>
      <Text>
        {t('paymentLinkEmail.text1')}
        <br />
        {t('paymentLinkEmail.text2')}
        <br />
        {t('paymentLinkEmail.text3')}
      </Text>
      <Text>
        <Trans t={t} i18nKey={'dueDateReminder.text1'} />{' '}
        {t('dueDateReminder.text2')}
      </Text>
    </div>
  );
};
