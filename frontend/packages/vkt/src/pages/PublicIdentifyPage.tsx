import { Box, Grid } from '@mui/material';
import { FC } from 'react';

import { PublicIdentifyGrid } from 'components/publicIdentify/PublicIdentifyGrid';

export const PublicIdentifyPage: FC = () => {
  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        <PublicIdentifyGrid />
      </Grid>
    </Box>
  );
};
