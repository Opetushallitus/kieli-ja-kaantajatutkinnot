import { Box, Grid } from '@mui/material';
import { FC, useEffect } from 'react';

import { PublicInterpreterGrid } from 'components/publicInterpreter/PublicInterpreterGrid';
import { useAppDispatch } from 'configs/redux';
import { loadPublicInterpreters } from 'redux/actions/publicInterpreter';

export const PublicHomePage: FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadPublicInterpreters);
  }, [dispatch]);

  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        <PublicInterpreterGrid />
      </Grid>
    </Box>
  );
};
