import { Grid, Paper } from '@mui/material';
import { LoadingProgressIndicator } from 'shared/components';

import { Done } from 'components/publicEnrollment/steps/Done';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';

export const PublicEnrollmentDoneGrid = ({
  step,
}: {
  step: PublicEnrollmentFormStep;
}) => {
  const isLoading = false;

  const renderDesktopView = () => (
    <Grid className="public-enrollment__grid" item>
      <Paper elevation={3}>
        <LoadingProgressIndicator isLoading={isLoading} displayBlock={true}>
          <div className="public-enrollment__grid__form-container">
            <Done step={step} />
          </div>
        </LoadingProgressIndicator>
      </Paper>
    </Grid>
  );

  return (
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="public-enrollment"
    >
      {renderDesktopView()}
    </Grid>
  );
};
