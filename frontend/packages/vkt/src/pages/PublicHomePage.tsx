import { Box, Grid } from '@mui/material';
import { FC } from 'react';

import { PublicExamEventGrid } from 'components/publicExamEvent/PublicExamEventGrid';

export const PublicHomePage: FC = () => (
  <Box className="public-homepage">
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="public-homepage__grid-container"
    >
      <PublicExamEventGrid />
    </Grid>
  </Box>
);
