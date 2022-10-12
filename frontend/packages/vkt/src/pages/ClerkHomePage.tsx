import { Box, Grid } from '@mui/material';
import { FC, useEffect } from 'react';
import { APIResponseStatus } from 'shared/enums';

import { ClerkExamEventGrid } from 'components/clerkExamEvent/ClerkExamEventGrid';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { loadExamEvents } from 'redux/reducers/clerkListExamEvent';
import { clerkListExamEventsSelector } from 'redux/selectors/clerkListExamEvent';

export const ClerkHomePage: FC = () => {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector(clerkListExamEventsSelector);

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadExamEvents());
    }
  }, [dispatch, status]);

  return (
    <Box className="clerk-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-homepage__grid-container"
      >
        <ClerkExamEventGrid />
      </Grid>
    </Box>
  );
};
