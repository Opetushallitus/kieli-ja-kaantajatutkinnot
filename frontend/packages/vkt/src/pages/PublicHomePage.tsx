import { Box, Grid } from '@mui/material';
import { FC } from 'react';

import { PublicExamEventGrid } from 'components/publicExamEvent/PublicExamEventGrid';

const PublicHomePage: FC = () => {
  return (
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
};

export default PublicHomePage;
