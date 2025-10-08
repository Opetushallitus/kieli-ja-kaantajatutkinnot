import { ChevronRight, HomeOutlined } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper, Typography } from '@mui/material';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { ClerkFreeRegistrationDetails } from 'components/clerkFreeRegistration/FreeRegistrationDetails';
import { usePublicTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

export const ClerkFreeRegistrationDetailsPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.clerkFreeRegistrationDetailsPage',
  });

  const navigate = useNavigate();

  return (
    <Box className="clerk-free-registration-details-page">
      <Typography variant="h2" component={'div'}>
        <div className="columns gapped-xs">
          <IconButton
            color="secondary"
            className="clerk-free-registration-details-page__home-button"
            onClick={() => navigate(AppRoutes.ClerkFreeRegistration)}
          >
            <HomeOutlined color="secondary" fontSize="large" />
          </IconButton>
          <ChevronRight color="disabled" fontSize="large" />
          {t('heading')}
        </div>
      </Typography>

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
