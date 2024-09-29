import { Grid } from '@mui/material';

import { PublicEnrollmentAppointmentDesktopGrid } from 'components/publicEnrollmentAppointment/PublicEnrollmentAppointmentDesktopGrid';
import { PublicEnrollmentAppointmentFormStep } from 'enums/publicEnrollment';
import { publicEnrollmentAppointmentSelector } from 'redux/selectors/publicEnrollmentAppointment';

export const PublicEnrollmentAppointmentGrid = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentAppointmentFormStep;
}) => {
  const { enrollment } = useAppSelector(publicEnrollmentAppointmentSelector);

  return (
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="public-enrollment"
    >
      <PublicEnrollmentAppointmentDesktopGrid
        enrollment={enrollment}
        activeStep={activeStep}
      />
    </Grid>
  );
};
