import { Paper } from '@mui/material';
import { FC } from 'react';
import { useWindowProperties } from 'shared/hooks';

import { BackToFrontPageButton } from 'components/elements/BackToFrontPageButton';
import { H1, Text } from 'components/Text';
import { usePublicTranslation } from 'configs/i18n';

export const NotFoundPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.notFoundPage',
  });
  const { isPhone } = useWindowProperties();

  return (
    <div className="not-found-page">
      <div className="rows">
        <H1>{t('title')}</H1>
      </div>
      <Paper elevation={isPhone ? 0 : 3} className="not-found-page__info">
        <Text>{t('description')}</Text>
        <BackToFrontPageButton />
      </Paper>
    </div>
  );
};
