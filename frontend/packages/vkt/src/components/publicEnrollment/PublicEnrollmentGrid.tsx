import { Grid, Paper } from '@mui/material';
import { useState } from 'react';
import { LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { PublicEnrollmentControlButtons } from 'components/publicEnrollment/PublicEnrollmentControlButtons';
import { PublicEnrollmentExamEventDetails } from 'components/publicEnrollment/PublicEnrollmentExamEventDetails';
import { PublicEnrollmentPaymentSum } from 'components/publicEnrollment/PublicEnrollmentPaymentSum';
import { PublicEnrollmentStepContents } from 'components/publicEnrollment/PublicEnrollmentStepContents';
import { PublicEnrollmentStepper } from 'components/publicEnrollment/PublicEnrollmentStepper';
import { PublicEnrollmentTimer } from 'components/publicEnrollment/PublicEnrollmentTimer';
import { useAppSelector } from 'configs/redux';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { publicExamEventsSelector } from 'redux/selectors/publicExamEvent';

export const PublicEnrollmentGrid = () => {
  const [isStepValid, setIsStepValid] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const { status, activeStep, enrollment, reservationDetails } = useAppSelector(
    publicEnrollmentSelector
  );
  const { selectedExamEvent } = useAppSelector(publicExamEventsSelector);

  useNavigationProtection(activeStep > PublicEnrollmentFormStep.Identify);

  if (!selectedExamEvent) {
    return null;
  }

  const isLoading = status === APIResponseStatus.InProgress;
  const isPreviewStepActive = activeStep === PublicEnrollmentFormStep.Preview;
  const isDoneStepActive = activeStep === PublicEnrollmentFormStep.Done;
  const hasReservation = !!reservationDetails?.reservation;

  const renderDesktopView = () => (
    <>
      <Grid className="public-enrollment__grid" item>
        <Paper elevation={3}>
          <LoadingProgressIndicator isLoading={isLoading} displayBlock={true}>
            <div className="public-enrollment__grid__form-container">
              <PublicEnrollmentStepper
                activeStep={activeStep}
                includePaymentStep={hasReservation}
              />
              {reservationDetails?.reservation && (
                <PublicEnrollmentTimer
                  reservation={reservationDetails.reservation}
                  isLoading={isLoading}
                />
              )}
              <PublicEnrollmentExamEventDetails
                examEvent={selectedExamEvent}
                showOpenings={hasReservation && !isDoneStepActive}
              />
              <PublicEnrollmentStepContents
                examEvent={selectedExamEvent}
                activeStep={activeStep}
                enrollment={enrollment}
                isLoading={isLoading}
                setIsStepValid={setIsStepValid}
                showValidation={showValidation}
              />
              {isPreviewStepActive && reservationDetails?.reservation && (
                <PublicEnrollmentPaymentSum enrollment={enrollment} />
              )}
              {!isDoneStepActive && reservationDetails && (
                <PublicEnrollmentControlButtons
                  activeStep={activeStep}
                  enrollment={enrollment}
                  reservationDetails={reservationDetails}
                  isLoading={isLoading}
                  isStepValid={isStepValid}
                  setShowValidation={setShowValidation}
                />
              )}
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
