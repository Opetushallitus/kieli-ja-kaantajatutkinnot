import { ChevronRight, HomeOutlined } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper, Typography } from '@mui/material';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { ClerkFreeRegistrationDetails } from 'components/clerkFreeRegistration/FreeRegistrationDetails';
import { usePublicTranslation } from 'configs/i18n';

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
            onClick={() => navigate(-1)}
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
