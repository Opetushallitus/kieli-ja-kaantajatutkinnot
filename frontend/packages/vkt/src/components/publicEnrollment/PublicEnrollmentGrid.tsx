import { Grid, Paper } from '@mui/material';
import { useState } from 'react';
import { LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { PublicEnrollmentControlButtons } from 'components/publicEnrollment/PublicEnrollmentControlButtons';
import { PublicEnrollmentPaymentSum } from 'components/publicEnrollment/PublicEnrollmentPaymentSum';
import { PublicEnrollmentReservationDetails } from 'components/publicEnrollment/PublicEnrollmentReservationDetails';
import { PublicEnrollmentStepContents } from 'components/publicEnrollment/PublicEnrollmentStepContents';
import { PublicEnrollmentStepper } from 'components/publicEnrollment/PublicEnrollmentStepper';
import { useAppSelector } from 'configs/redux';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';

export const PublicEnrollmentGrid = () => {
  const [disableNext, setDisableNext] = useState(true);

  const disableNextCb = (disabled: boolean) => setDisableNext(disabled);

  const { status, activeStep, enrollment } = useAppSelector(
    publicEnrollmentSelector
  );
  const isLoading = status === APIResponseStatus.InProgress;

  const renderDesktopView = () => (
    <>
      <Grid className="public-enrollment__grid" item>
        <Paper elevation={3}>
          <LoadingProgressIndicator isLoading={isLoading} displayBlock={true}>
            <div className="public-enrollment__grid__form-container">
              <PublicEnrollmentStepper activeStep={activeStep} />
              <PublicEnrollmentReservationDetails />
              <PublicEnrollmentStepContents
                activeStep={activeStep}
                enrollment={enrollment}
                isLoading={isLoading}
                disableNext={disableNextCb}
              />
              <PublicEnrollmentPaymentSum
                activeStep={activeStep}
                enrollment={enrollment}
              />
              <PublicEnrollmentControlButtons
                activeStep={activeStep}
                isLoading={isLoading}
                disableNext={disableNext}
              />
            </div>
          </LoadingProgressIndicator>
        </Paper>
      </Grid>
    </>
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
