import { Box, Grid, Paper } from '@mui/material';
import { FC } from 'react';
import { H2 } from 'shared/components';

import { ClerkFreeEnrollment } from 'components/clerkFreeEnrollment/ClerkFreeEnrollment';

export const FreeEnrollmentPage: FC = () => {
  return (
    <Box className="clerk-free-enrollment-page">
      <H2>Maksuttomuuden tarkastukset</H2>
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-free-enrollment-page__grid-container"
      >
        <Paper
          elevation={3}
          className="clerk-free-enrollment-page__grid-container__results"
        >
          <ClerkFreeEnrollment />
        </Paper>
      </Grid>
    </Box>
  );
};
