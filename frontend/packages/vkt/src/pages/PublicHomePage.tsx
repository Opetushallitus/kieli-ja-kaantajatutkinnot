import { Box, Grid } from '@mui/material';
import { FC, useEffect } from 'react';

import { PublicExamEventGrid } from 'components/publicExamEvent/PublicExamEventGrid';
import { useAppDispatch } from 'configs/redux';
import { loadPublicExamEvents } from 'redux/reducers/publicExamEvent';

export const PublicHomePage: FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadPublicExamEvents());
  }, [dispatch]);

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
