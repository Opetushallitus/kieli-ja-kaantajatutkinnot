import { Box, Grid, Paper, Typography } from '@mui/material';
import { FC } from 'react';

import { ClerkQuarantine } from 'components/clerkQuarantine/ClerkQuarantine';
import { usePublicTranslation } from 'configs/i18n';

export const ClerkQuarantinePage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.clerkQuarantinePage',
  });

  return (
    <Box className="clerk-quarantine-page">
      <Typography variant="h2">{t('heading')}</Typography>
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-quarantine-page__grid-container"
      >
        <Paper
          elevation={3}
          className="clerk-quarantine-page__grid-container__results"
        >
          <ClerkQuarantine />
        </Paper>
      </Grid>
    </Box>
  );
};
