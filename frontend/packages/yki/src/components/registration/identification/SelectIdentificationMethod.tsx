import DoneIcon from '@mui/icons-material/Done';
import { useEffect } from 'react';
import { H2, Text } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { EmailIdentification } from 'components/registration/identification/EmailIdentification';
import { SuomiFiIdentification } from 'components/registration/identification/SuomiFiIdentification';
import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { publicIdentificationSelector } from 'redux/selectors/publicIdentifaction';

export const SelectIdentificationMethod = () => {
  const { showToast } = useToast();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });
  const { emailLinkOrder } = useAppSelector(publicIdentificationSelector);

  useEffect(() => {
    if (emailLinkOrder.status === APIResponseStatus.Error) {
      showToast({
        severity: Severity.Error,
        description: t('emailLink.error'),
      });
    }
  }, [emailLinkOrder.status, showToast, t]);

  if (emailLinkOrder.status === APIResponseStatus.Success) {
    return (
      <div className="columns gapped public-registration--email-link-order__success">
        <DoneIcon fontSize="large" />
        <Text>
          {t('emailLink.success')} <strong>{emailLinkOrder.email}</strong>
        </Text>
      </div>
    );
  } else {
    return (
      <>
        <H2>{t('title')}</H2>
        <Text>{t('caption')}</Text>
        <SuomiFiIdentification />
        <EmailIdentification />
      </>
    );
  }
};
