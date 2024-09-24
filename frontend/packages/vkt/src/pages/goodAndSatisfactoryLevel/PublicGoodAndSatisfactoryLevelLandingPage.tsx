import { Box, Grid } from '@mui/material';
import { FC } from 'react';
import { H1, HeaderSeparator } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';

export const PublicGoodAndSatisfactoryLevelLandingPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.goodAndSatisfactoryLevel',
  });

  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        <Grid item className="public-homepage__grid-container__item-header">
          <H1 data-testid="public-homepage__title-heading">{t('title')}</H1>
          <HeaderSeparator />
        </Grid>
      </Grid>
    </Box>
  );
};
