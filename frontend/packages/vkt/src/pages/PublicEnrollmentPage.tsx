import { Box, Grid } from '@mui/material';
import { FC } from 'react';

import { PublicEnrollmentGrid } from 'components/publicEnrollment/PublicEnrollmentGrid';

export const PublicEnrollmentPage: FC = () => {
  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        <PublicEnrollmentGrid />
      </Grid>
    </Box>
  );
};
