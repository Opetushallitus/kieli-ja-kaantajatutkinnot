import { Text } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';

export const DialogContents = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage.abortDialog',
  });

  return (
    <div className="rows gapped-xs">
      <Text>{t('description')}</Text>
      <Text>{t('notice')}</Text>
    </div>
  );
};
