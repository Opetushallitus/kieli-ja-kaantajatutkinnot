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
import { AppRoutes, EnrollmentStatus } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import {
  loadPublicEnrollment,
  resetPublicEnrollment,
} from 'redux/reducers/publicEnrollment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';

export const PublicEnrollmentGrid = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentFormStep;
}) => {
  const dispatch = useAppDispatch();
  const [isStepValid, setIsStepValid] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const params = useParams();

  const {
    status,
    enrollmentSubmitStatus,
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

  useNavigationProtection(
    activeStep > PublicEnrollmentFormStep.Authenticate &&
      activeStep < PublicEnrollmentFormStep.Preview &&
      cancelStatus === APIResponseStatus.NotStarted,
    '/vkt/ilmoittaudu'
  );

  const isLoading = [status].includes(APIResponseStatus.InProgress);
  const isPreviewStepActive = activeStep === PublicEnrollmentFormStep.Preview;
  const isDoneStepActive = activeStep >= PublicEnrollmentFormStep.Done;
  const hasReservation = !!reservationDetails?.reservation;
  const isExpectedToHaveOpenings = !enrollToQueue;

  const isShiftedFromQueue =
    enrollment.status === EnrollmentStatus.SHIFTED_FROM_QUEUE;

  const isPaymentSumAvailable =
    isPreviewStepActive &&
    (reservationDetails?.reservation || isShiftedFromQueue);

  const renderDesktopView = () => (
    <>
      <Grid className="public-enrollment__grid" item>
        <Paper elevation={3}>
          <LoadingProgressIndicator isLoading={isLoading} displayBlock={true}>
            {selectedExamEvent && (
              <div className="public-enrollment__grid__form-container">
                {!isShiftedFromQueue && (
                  <PublicEnrollmentStepper
                    activeStep={activeStep}
                    includePaymentStep={hasReservation}
                  />
                )}
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
                  activeStep={activeStep}
                  enrollment={enrollment}
                  isLoading={isLoading}
                  setIsStepValid={setIsStepValid}
                  showValidation={showValidation}
                  isExpectedToHaveOpenings={isExpectedToHaveOpenings}
                />
                {isPaymentSumAvailable && (
                  <PublicEnrollmentPaymentSum enrollment={enrollment} />
                )}
                {!isDoneStepActive && reservationDetails && (
                  <PublicEnrollmentControlButtons
                    submitStatus={enrollmentSubmitStatus}
                    activeStep={activeStep}
                    enrollment={enrollment}
                    reservationDetails={reservationDetails}
                    isLoading={isLoading}
                    isStepValid={isStepValid}
                    setShowValidation={setShowValidation}
                    isPaymentLinkPreviewView={
                      isShiftedFromQueue && isPreviewStepActive
                    }
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
