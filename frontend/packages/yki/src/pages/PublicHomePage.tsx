import { Box, Grid } from '@mui/material';
import { FC } from 'react';
import { H1 } from 'shared/components';

export const PublicHomePage: FC = () => {
  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        <H1 data-testid="public-homepage__title-heading">
          Yleiset kielitutkinnot (YKI) - Ilmoittautuminen
        </H1>
      </Grid>
    </Box>
  );
};
