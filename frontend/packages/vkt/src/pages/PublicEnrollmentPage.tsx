import { Box, Grid } from '@mui/material';

import { PublicEnrollmentGrid } from 'components/publicEnrollment/PublicEnrollmentGrid';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';

const PublicEnrollmentPage = ({
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
        <PublicEnrollmentGrid activeStep={activeStep} />
      </Grid>
    </Box>
  );
};

export default PublicEnrollmentPage;
