import { Box, Grid, Paper } from '@mui/material';
import { FC } from 'react';
import { H2 } from 'shared/components';

import { ClerkFreeRegistration } from 'components/clerkFreeRegistration/ClerkFreeRegistration';

export const FreeRegistrationPage: FC = () => {
  return (
    <Box className="clerk-free-registration-page">
      <H2>Maksuttomuuden tarkastukset</H2>
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
