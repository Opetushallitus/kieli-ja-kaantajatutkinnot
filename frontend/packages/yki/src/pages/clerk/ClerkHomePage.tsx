import { Grid, Paper } from '@mui/material';
import { FC } from 'react';
import { H1, Text } from 'shared/components';

export const ClerkHomePage: FC = () => {
  return (
    <div className="clerk-homepage">
      <H1>Hello</H1>
      <Paper elevation={3}>
        <Grid
          container
          direction="column"
          className="clerk-homepage__grid-container"
        >
          <Grid item>
            <div className="columns gapped grow">
              <Text>Todellakin uusi virkailijan UI</Text>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};
