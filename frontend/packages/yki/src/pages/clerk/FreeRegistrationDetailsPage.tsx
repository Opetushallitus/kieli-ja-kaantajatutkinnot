import { ChevronRight, HomeOutlined } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper } from '@mui/material';
import { FC } from 'react';
import { H2 } from 'shared/components';

import { ClerkFreeRegistrationDetails } from 'components/clerkFreeRegistration/FreeRegistrationDetails';
import { usePublicTranslation } from 'configs/i18n';

export const FreeRegistrationDetailsPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.clerkFreeRegistrationDetailsPage',
  });

  return (
    <Box className="clerk-free-registration-details-page">
      <H2>
        <div className="columns gapped-xs">
          <IconButton
            style={{
              backgroundColor: 'white',
              borderRadius: '4px',
              borderColor: 'blue',
              borderWidth: '2px',
              borderStyle: 'solid',
            }}
          >
            <HomeOutlined
              style={{
                fontSize: '2rem',
                color: 'blue',
              }}
            />
          </IconButton>
          <ChevronRight style={{ color: 'grey', fontSize: '2rem' }} />
          {t('heading')}
        </div>
      </H2>

      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-free-registration-details-page__grid-container"
      >
        <Paper
          elevation={3}
          className="clerk-free-registration-details-page__grid-container__results"
        >
          <ClerkFreeRegistrationDetails />
        </Paper>
      </Grid>
    </Box>
  );
};
