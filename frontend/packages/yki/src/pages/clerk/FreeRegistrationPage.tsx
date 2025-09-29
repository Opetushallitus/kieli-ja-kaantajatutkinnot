import { Box, Grid, Paper } from '@mui/material';
import { FC } from 'react';
import { H2 } from 'shared/components';

import { ClerkFreeRegistration } from 'components/clerkFreeRegistration/ClerkFreeRegistration';
import { usePublicTranslation } from 'configs/i18n';

export const FreeRegistrationPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.clerkFreeRegistrationPage',
  });

  return (
    <Box className="clerk-free-registration-page">
      <H2>{t('heading')}</H2>
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
