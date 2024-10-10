import { Box, Grid } from '@mui/material';

import { PublicEnrollmentContactGrid } from 'components/publicEnrollmentAppointment/PublicEnrollmentContactGrid';
import { PublicEnrollmentContactFormStep } from 'enums/publicEnrollment';

export const PublicEnrollmentContactPage = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentContactFormStep;
}) => {
  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        <PublicEnrollmentContactGrid activeStep={activeStep} />
      </Grid>
    </Box>
  );
};
