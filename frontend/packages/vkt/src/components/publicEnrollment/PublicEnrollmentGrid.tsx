import { Grid, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { PublicEnrollmentControlButtons } from 'components/publicEnrollment/PublicEnrollmentControlButtons';
import { PublicEnrollmentExamEventDetails } from 'components/publicEnrollment/PublicEnrollmentExamEventDetails';
import { PublicEnrollmentPaymentSum } from 'components/publicEnrollment/PublicEnrollmentPaymentSum';
import { PublicEnrollmentStepContents } from 'components/publicEnrollment/PublicEnrollmentStepContents';
import { PublicEnrollmentStepper } from 'components/publicEnrollment/PublicEnrollmentStepper';
import { PublicEnrollmentTimer } from 'components/publicEnrollment/PublicEnrollmentTimer';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
//import { useNavigationProtection } from 'hooks/useNavigationProtection';
import {
  loadPublicEnrollment,
  resetPublicEnrollment,
} from 'redux/reducers/publicEnrollment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';

export const PublicEnrollmentGrid = ({
  step,
}: {
  step: PublicEnrollmentFormStep;
}) => {
  const dispatch = useAppDispatch();
  const [isStepValid, setIsStepValid] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const params = useParams();

  const {
    status,
    cancelStatus,
    enrollToQueue,
    enrollment,
    reservationDetails,
    reservationDetailsStatus,
    selectedExamEvent,
  } = useAppSelector(publicEnrollmentSelector);

  const navigate = useNavigate();

  useEffect(() => {
    if (
      reservationDetailsStatus === APIResponseStatus.NotStarted &&
      !reservationDetails &&
      !selectedExamEvent &&
      params.examEventId
    ) {
      dispatch(loadPublicEnrollment(+params.examEventId));
    }
  }, [
    dispatch,
    reservationDetailsStatus,
    enrollment,
    reservationDetails,
    selectedExamEvent,
    params.examEventId,
  ]);

  useEffect(() => {
    if (cancelStatus === APIResponseStatus.Success) {
      navigate(AppRoutes.PublicHomePage);
      dispatch(resetPublicEnrollment());
    }
  }, [cancelStatus, navigate, dispatch]);

  /*
  useNavigationProtection(
    activeStep > PublicEnrollmentFormStep.Authenticate &&
      activeStep < PublicEnrollmentFormStep.Preview &&
      cancelStatus === APIResponseStatus.NotStarted
  );
  */
  const isLoading = [status].includes(APIResponseStatus.InProgress);
  const isPreviewStepActive = step === PublicEnrollmentFormStep.Preview;
  const isDoneStepActive = step === PublicEnrollmentFormStep.Done;
  const hasReservation = !!reservationDetails?.reservation;
  const isExpectedToHaveOpenings = !enrollToQueue;

  const renderDesktopView = () => (
    <>
      <Grid className="public-enrollment__grid" item>
        <Paper elevation={3}>
          <LoadingProgressIndicator isLoading={isLoading} displayBlock={true}>
            {selectedExamEvent && (
              <div className="public-enrollment__grid__form-container">
                <PublicEnrollmentStepper
                  activeStep={step}
                  includePaymentStep={hasReservation}
                />
                {reservationDetails?.reservation && !isDoneStepActive && (
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
                  selectedExamEvent={selectedExamEvent}
                  activeStep={step}
                  enrollment={enrollment}
                  isLoading={isLoading}
                  setIsStepValid={setIsStepValid}
                  showValidation={showValidation}
                  isExpectedToHaveOpenings={isExpectedToHaveOpenings}
                />
                {isPreviewStepActive && reservationDetails?.reservation && (
                  <PublicEnrollmentPaymentSum enrollment={enrollment} />
                )}
                {!isDoneStepActive && reservationDetails && (
                  <PublicEnrollmentControlButtons
                    status={status}
                    activeStep={step}
                    enrollment={enrollment}
                    reservationDetails={reservationDetails}
                    isLoading={isLoading}
                    isStepValid={isStepValid}
                    setShowValidation={setShowValidation}
                  />
                )}
              </div>
            )}
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
