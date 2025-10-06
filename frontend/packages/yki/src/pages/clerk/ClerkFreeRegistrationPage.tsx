import { Box, Grid, Paper, Typography } from '@mui/material';
import { FC } from 'react';

import { ClerkFreeRegistration } from 'components/clerkFreeRegistration/ClerkFreeRegistration';
import { usePublicTranslation } from 'configs/i18n';

export const ClerkFreeRegistrationPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.clerkFreeRegistrationPage',
  });

  return (
    <Box className="clerk-free-registration-page">
      <Typography variant="h2">{t('heading')}</Typography>
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-free-registration-page__grid-container"
      >
        <Paper
          elevation={3}
          className="clerk-free-registration-page__grid-container__results"
        >
          <ClerkFreeRegistration />
        </Paper>
      </Grid>
    </Box>
  );
};
