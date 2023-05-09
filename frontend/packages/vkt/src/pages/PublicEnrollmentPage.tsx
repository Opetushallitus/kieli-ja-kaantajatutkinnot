import { Box, Grid } from '@mui/material';
import { FC, useEffect } from 'react';

import { PublicEnrollmentGrid } from 'components/publicEnrollment/PublicEnrollmentGrid';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { setSelectedPublicExamEvent } from 'redux/reducers/publicExamEvent';
import { publicExamEventsSelector } from 'redux/selectors/publicExamEvent';
import { SerializationUtils } from 'utils/serialization';

export const PublicEnrollmentPage: FC = ({ step }: { step: string }) => {
  const { selectedExamEvent } = useAppSelector(publicExamEventsSelector);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const examEvent = sessionStorage.getItem('examEvent');

    if (examEvent && !selectedExamEvent) {
      dispatch(
        setSelectedPublicExamEvent(
          SerializationUtils.deserializePublicExamEvent(JSON.parse(examEvent))
        )
      );
    }
  }, [dispatch, selectedExamEvent]);

  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        <PublicEnrollmentGrid step={step} />
      </Grid>
    </Box>
  );
};
