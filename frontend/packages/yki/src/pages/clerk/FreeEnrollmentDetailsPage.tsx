import { ChevronRight, HomeOutlined } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper } from '@mui/material';
import { FC } from 'react';
import { H2 } from 'shared/components';

import { ClerkFreeEnrollmentDetails } from 'components/clerkFreeEnrollment/FreeEnrollmentDetails';
import { usePublicTranslation } from 'configs/i18n';

export const FreeEnrollmentDetailsPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.clerkFreeEnrollmentDetailsPage',
  });

  return (
    <Box className="clerk-free-enrollment-details-page">
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
        className="clerk-free-enrollment-details-page__grid-container"
      >
        <Paper
          elevation={3}
          className="clerk-free-enrollment-details-page__grid-container__results"
        >
          <ClerkFreeEnrollmentDetails />
        </Paper>
      </Grid>
    </Box>
  );
};
