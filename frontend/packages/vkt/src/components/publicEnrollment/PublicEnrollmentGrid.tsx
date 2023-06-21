import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { APIResponseStatus } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { PublicEnrollmentDesktopGrid } from 'components/publicEnrollment/PublicEnrollmentDesktopGrid';
import { PublicEnrollmentPhoneGrid } from 'components/publicEnrollment/PublicEnrollmentPhoneGrid';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, EnrollmentStatus } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import {
  loadPublicEnrollment,
  loadPublicExamEvent,
  resetPublicEnrollment,
} from 'redux/reducers/publicEnrollment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';

export const PublicEnrollmentGrid = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentFormStep;
}) => {
  // State
  const [isStepValid, setIsStepValid] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Redux
  const dispatch = useAppDispatch();
  const {
    renewReservationStatus,
    enrollmentSubmitStatus,
    cancelStatus,
    enrollment,
    reservationDetails,
    reservationDetailsStatus,
    selectedExamEvent,
  } = useAppSelector(publicEnrollmentSelector);

  const navigate = useNavigate();
  const params = useParams();
  const { isPhone } = useWindowProperties();

  useEffect(() => {
    if (
      reservationDetailsStatus === APIResponseStatus.NotStarted &&
      !reservationDetails &&
      !selectedExamEvent &&
      params.examEventId
    ) {
      if (activeStep === PublicEnrollmentFormStep.Authenticate) {
        dispatch(loadPublicExamEvent(+params.examEventId));
      } else {
        dispatch(loadPublicEnrollment(+params.examEventId));
      }
    }
  }, [
    dispatch,
    reservationDetailsStatus,
    enrollment,
    reservationDetails,
    selectedExamEvent,
    params.examEventId,
    activeStep,
  ]);

  useEffect(() => {
    if (cancelStatus === APIResponseStatus.Success) {
      navigate(AppRoutes.PublicHomePage);

      // Navigation is not instant so we delay reset a bit
      // to prevent instant re-render of this component
      setTimeout(() => dispatch(resetPublicEnrollment()), 50);
    }
  }, [cancelStatus, navigate, dispatch]);

  useNavigationProtection(
    activeStep > PublicEnrollmentFormStep.Authenticate &&
      activeStep < PublicEnrollmentFormStep.Preview &&
      cancelStatus === APIResponseStatus.NotStarted,
    AppRoutes.PublicEnrollment
  );

  const isLoading = [
    renewReservationStatus,
    cancelStatus,
    enrollmentSubmitStatus,
  ].includes(APIResponseStatus.InProgress);
  const isAuthenticateStepActive =
    activeStep === PublicEnrollmentFormStep.Authenticate;
  const isPreviewStepActive = activeStep === PublicEnrollmentFormStep.Preview;
  const isDoneStepActive = activeStep >= PublicEnrollmentFormStep.Done;

  const isShiftedFromQueue =
    enrollment.status === EnrollmentStatus.SHIFTED_FROM_QUEUE;

  const isPaymentSumAvailable =
    isPreviewStepActive &&
    (reservationDetails?.reservation || isShiftedFromQueue);

  return (
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="public-enrollment"
    >
      {isPhone ? (
        <PublicEnrollmentPhoneGrid
          isStepValid={isStepValid}
          isLoading={isLoading}
          isShiftedFromQueue={isShiftedFromQueue}
          isPaymentSumAvailable={!!isPaymentSumAvailable}
          isAuthenticateStepActive={isAuthenticateStepActive}
          isPreviewStepActive={isPreviewStepActive}
          isDoneStepActive={isDoneStepActive}
          setShowValidation={setShowValidation}
          setIsStepValid={setIsStepValid}
          showValidation={showValidation}
          activeStep={activeStep}
        />
      ) : (
        <PublicEnrollmentDesktopGrid
          isStepValid={isStepValid}
          isLoading={isLoading}
          isShiftedFromQueue={isShiftedFromQueue}
          isPaymentSumAvailable={!!isPaymentSumAvailable}
          isAuthenticateStepActive={isAuthenticateStepActive}
          isPreviewStepActive={isPreviewStepActive}
          isDoneStepActive={isDoneStepActive}
          setShowValidation={setShowValidation}
          setIsStepValid={setIsStepValid}
          showValidation={showValidation}
          activeStep={activeStep}
        />
      )}
    </Grid>
  );
};
