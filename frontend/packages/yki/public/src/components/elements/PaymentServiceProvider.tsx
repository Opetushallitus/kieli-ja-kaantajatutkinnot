import { Trans } from 'react-i18next';
import { H3, Text, WebLink } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';

export const PaymentServiceProvider = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.paymentServiceProvider',
  });

  return (
    <div className="rows gapped">
      <H3>{t('title')}</H3>
      <Text>{t('description')}</Text>
      <Text>
        <Trans t={t} i18nKey="contactDetails" />
      </Text>
      <Text sx={{ overflowWrap: 'anywhere' }}>
        {t('businessId')}
        <br />
        <WebLink href={t('url')} label={t('url')} />
      </Text>
    </div>
  );
};
