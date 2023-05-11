import { Box, Grid } from '@mui/material';
import { FC } from 'react';

import { PublicEnrollmentDoneGrid } from 'components/publicEnrollment/PublicEnrollmentDoneGrid';
import { PublicEnrollmentGrid } from 'components/publicEnrollment/PublicEnrollmentGrid';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';

export const PublicEnrollmentPage: FC = ({
  step,
}: {
  step: PublicEnrollmentFormStep;
}) => {
  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        {step <= PublicEnrollmentFormStep.Preview ? (
          <PublicEnrollmentGrid step={step} />
        ) : (
          <PublicEnrollmentDoneGrid step={step} />
        )}
      </Grid>
    </Box>
  );
};
