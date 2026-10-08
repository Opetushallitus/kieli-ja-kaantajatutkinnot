import { Box, Grid, Paper, Typography } from '@mui/material';
import { FC } from 'react';

import { ClerkStatisticsFilter } from 'components/clerkStatistics/ClerkStatisticsFilter';
import { usePublicTranslation } from 'configs/i18n';

export const ClerkStatisticsPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.clerkStatisticsPage',
  });

  return (
    <Box className="clerk-statistics-page">
      <Typography variant="h2">{t('heading')}</Typography>
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-statistics-page__grid-container"
      >
        <Paper
          elevation={3}
          className="clerk-statistics-page__grid-container__results"
        >
          <ClerkStatisticsFilter />
        </Paper>
      </Grid>
    </Box>
  );
};
