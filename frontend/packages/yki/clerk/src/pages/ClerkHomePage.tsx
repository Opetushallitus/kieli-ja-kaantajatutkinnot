import { Box, Grid, Paper, Typography } from '@mui/material';
import { FC } from 'react';

import { ClerkRegister } from 'components/clerkRegister/ClerkRegister';
import { usePublicTranslation } from 'configs/i18n';

export const ClerkHomePage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.clerkRegisterPage',
  });

  return (
    <Box className="clerk-register-page">
      <Typography variant="h2">{t('heading')}</Typography>
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-register-page__grid-container"
      >
        <Paper
          elevation={3}
          className="clerk-register-page__grid-container__results"
        >
          <ClerkRegister />
        </Paper>
      </Grid>
    </Box>
  );
};
