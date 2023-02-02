import { Box, Grid } from '@mui/material';
import { FC } from 'react';
import { H1 } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';

export const RegistrationPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage',
  });

  return (
    <Box className="public-registration-page">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-registration-page__grid-container"
      >
        <H1 data-testid="public-registration-page__title-heading">
          {t('title')}
        </H1>
      </Grid>
    </Box>
  );
};
