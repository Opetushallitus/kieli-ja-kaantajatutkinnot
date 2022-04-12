import { FC } from 'react';

import { CustomButton } from 'components/elements/CustomButton';
import { H1, Text } from 'components/elements/Text';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

export const NotFoundPage: FC = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akt.pages.notFoundPage',
  });
  const translateCommon = useCommonTranslation();

  return (
    <div className="not-found-page">
      <H1>{t('title')}</H1>
      <Text>{t('description')}</Text>
      <CustomButton
        className="not-found-page__btn"
        color="secondary"
        variant="contained"
        href={AppRoutes.PublicHomePage}
      >
        {translateCommon('frontPage')}
      </CustomButton>
    </div>
  );
};
