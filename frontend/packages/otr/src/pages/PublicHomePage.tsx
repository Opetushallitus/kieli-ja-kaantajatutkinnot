import { Box, Grid } from '@mui/material';
import { FC, useEffect } from 'react';

import { PublicTranslatorGrid } from 'components/publicTranslator/PublicTranslatorGrid';
import { useAppDispatch } from 'configs/redux';
import { loadPublicTranslators } from 'redux/actions/publicTranslator';

export const PublicHomePage: FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadPublicTranslators);
  }, [dispatch]);

  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        <PublicTranslatorGrid />
      </Grid>
    </Box>
  );
};
