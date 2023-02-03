import { Box, Grid } from '@mui/material';
import { FC } from 'react';
import { H1 } from 'shared/components';

import { PublicExamEventGrid } from 'components/publicExamEvent/PublicExamEventGrid';
import { usePublicTranslation } from 'configs/i18n';

export const PublicHomePage: FC = () => {
  const { t } = usePublicTranslation({ keyPrefix: 'yki.pages.publicHomePage' });

  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        <H1 data-testid="public-homepage__title-heading">{t('title')}</H1>
        <PublicExamEventGrid />
      </Grid>
    </Box>
  );
};
