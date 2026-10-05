import { Trans } from 'react-i18next';
import { H2, Text, WebLink } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';

export const PaymentServiceProvider = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.paymentServiceProvider',
  });

  return (
    <div className="rows gapped">
      <H2>{t('title')}</H2>
      <div>
        <Text>{t('description')}</Text>
        <Text>
          <Trans t={t} i18nKey="contactDetails" />
        </Text>
        <Text>{t('businessId')}</Text>
        <Text sx={{ overflowWrap: 'anywhere' }}>
          <WebLink href={t('url')} label={t('url')} />
        </Text>
      </div>
    </div>
  );
};
