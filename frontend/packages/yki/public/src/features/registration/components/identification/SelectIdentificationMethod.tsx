import DoneIcon from '@mui/icons-material/Done';
import { useEffect } from 'react';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';
import { CommonUtils } from 'shared/utils';

import { H2, Text } from 'components/Text';
import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { EmailIdentification } from 'features/registration/components/identification/EmailIdentification';
import { SuomiFiIdentification } from 'features/registration/components/identification/SuomiFiIdentification';
import { publicIdentificationSelector } from 'features/registration/redux/selectors/publicIdentifaction';

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
    } else if (emailLinkOrder.status === APIResponseStatus.Success) {
      CommonUtils.scrollToTop();
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
        <H2>{t('selectIdentificationMethod')}</H2>
        <Text>{t('caption')}</Text>
        <SuomiFiIdentification />
        <EmailIdentification />
      </>
    );
  }
};
