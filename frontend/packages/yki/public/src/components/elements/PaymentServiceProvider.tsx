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
      <div>
        <Text>{t('description')}</Text>
        <Text>
          <Trans t={t} i18nKey="contactDetails" />
        </Text>
        <Text>{t('businessId')}</Text>
        <Text>
          <WebLink href={t('url')} label={t('url')} />
        </Text>
      </div>
    </div>
  );
};
