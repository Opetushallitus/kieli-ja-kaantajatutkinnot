import { Paper } from '@mui/material';
import { FC } from 'react';
import { CustomButton, H1, HeaderSeparator, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

export const NotFoundPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.notFoundPage',
  });
  const translateCommon = useCommonTranslation();
  const { isPhone } = useWindowProperties();

  return (
    <div className="not-found-page">
      <div className="rows">
        <H1>{t('title')}</H1>
        <HeaderSeparator />
      </div>
      <Paper elevation={isPhone ? 0 : 3} className="not-found-page__info">
        <Text>{t('description')}</Text>
        <CustomButton
          className="not-found-page__btn"
          color={Color.Secondary}
          variant={Variant.Contained}
          href={AppRoutes.Registration}
        >
          {translateCommon('backToHomePage')}
        </CustomButton>
      </Paper>
    </div>
  );
};
