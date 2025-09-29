import { Box, Grid, Paper } from '@mui/material';
import { FC } from 'react';
import { H2 } from 'shared/components';

import { ClerkRegister } from 'components/clerkRegister/ClerkRegister';
import { usePublicTranslation } from 'configs/i18n';

export const ClerkHomePage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.clerkRegisterPage',
  });

  return (
    <Box className="clerk-register-page">
      <H2>{t('heading')}</H2>
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
