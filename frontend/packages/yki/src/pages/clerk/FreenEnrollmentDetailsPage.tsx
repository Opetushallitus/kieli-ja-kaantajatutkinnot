import { Box, Grid, Paper } from '@mui/material';
import { FC } from 'react';
import { H2 } from 'shared/components';

import { ClerkFreeEnrollmentDetails } from 'components/clerkFreeEnrollment/FreeEnrollmentDetails';

export const FreeEnrollmentDetailsPage: FC = () => {
  return (
    <Box className="clerk-free-enrollment-details-page">
      <H2>Maksuttomuuden tarkastukset</H2>
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
