import { Trans } from 'react-i18next';
import { Text } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';

export const DialogContents = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage.abortDialog',
  });

  return (
    <div className="rows gapped-xs">
      <Text>{t('description')}</Text>
      <Text>
        <Trans t={t} i18nKey="notice" />
      </Text>
    </div>
  );
};
