import { Box, Grid } from '@mui/material';
import { FC } from 'react';

import { PublicAuthGrid } from 'components/publicAuth/PublicAuthGrid';

export const PublicAuthPage: FC = () => {
  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        <PublicAuthGrid />
      </Grid>
    </Box>
  );
};
