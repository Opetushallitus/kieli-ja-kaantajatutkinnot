import { Grid } from '@mui/material';

import { PublicEnrollmentAppointmentDesktopGrid } from 'components/publicEnrollmentAppointment/PublicEnrollmentAppointmentDesktopGrid';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';

export const PublicEnrollmentAppointmentGrid = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentFormStep;
}) => {
  return (
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="public-enrollment"
    >
      <PublicEnrollmentAppointmentDesktopGrid activeStep={activeStep} />
    </Grid>
  );
};
