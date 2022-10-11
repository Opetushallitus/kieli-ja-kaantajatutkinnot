import { Box, Grid } from '@mui/material';
import { FC } from 'react';

import { ClerkExamEventGrid } from 'components/clerkExamEvent/ClerkExamEventGrid';

export const ClerkHomePage: FC = () => (
  <Box className="clerk-homepage">
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="clerk-homepage__grid-container"
    >
      <ClerkExamEventGrid />
    </Grid>
  </Box>
);
