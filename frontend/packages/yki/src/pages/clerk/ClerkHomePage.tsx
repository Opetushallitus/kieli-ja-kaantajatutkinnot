import { Box, Grid, Paper } from '@mui/material';
import { FC } from 'react';
import { H2 } from 'shared/components';

import { ClerkRegister } from 'components/clerkRegister/ClerkRegister';

export const ClerkHomePage: FC = () => {
  return (
    <Box className="clerk-register-page">
      <H2>Kielitutkintojen järjestäjärekisteri</H2>
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
