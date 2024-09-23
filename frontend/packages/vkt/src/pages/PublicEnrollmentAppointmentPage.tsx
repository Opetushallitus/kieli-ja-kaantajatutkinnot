import { Box, Grid } from '@mui/material';

import { PublicEnrollmentAppointmentGrid } from 'components/publicEnrollmentAppointment/PublicEnrollmentAppointmentGrid';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';

export const PublicEnrollmentAppointmentPage = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentFormStep;
}) => {
  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        <PublicEnrollmentAppointmentGrid activeStep={activeStep} />
      </Grid>
    </Box>
  );
};
