import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { PublicEnrollmentDesktopGrid } from 'components/publicEnrollment/PublicEnrollmentDesktopGrid';
import { PublicEnrollmentPhoneGrid } from 'components/publicEnrollment/PublicEnrollmentPhoneGrid';
import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, EnrollmentStatus } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import {
  loadEnrollmentInitialisation,
  loadPublicExamEvent,
  resetPublicEnrollment,
} from 'redux/reducers/publicEnrollment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { ExamEventUtils } from 'utils/examEvent';

export const PublicEnrollmentGrid = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentFormStep;
}) => {
  // State
  const [isStepValid, setIsStepValid] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const translateCommon = useCommonTranslation();

  // Redux
  const dispatch = useAppDispatch();
  const {
    renewReservationStatus,
    enrollmentSubmitStatus,
    cancelStatus,
    enrollment,
    reservation,
    enrollmentInitialisationStatus,
    examEvent,
  } = useAppSelector(publicEnrollmentSelector);

  const navigate = useNavigate();
  const params = useParams();
  const { isPhone } = useWindowProperties();

  useEffect(() => {
    if (
      enrollmentInitialisationStatus === APIResponseStatus.NotStarted &&
      !examEvent &&
      params.examEventId
    ) {
      if (activeStep === PublicEnrollmentFormStep.Authenticate) {
        dispatch(loadPublicExamEvent(+params.examEventId));
      } else {
        dispatch(loadEnrollmentInitialisation(+params.examEventId));
      }
    }
  }, [
    dispatch,
    enrollmentInitialisationStatus,
    examEvent,
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

  if (
    enrollmentInitialisationStatus !== APIResponseStatus.Success ||
    !examEvent
  ) {
    return (
      <Grid className="public-enrollment__grid" item>
        <LoadingProgressIndicator
          isLoading={true}
          translateCommon={translateCommon}
          displayBlock={true}
        />
      </Grid>
    );
  }

  const isLoading = [
    renewReservationStatus,
    cancelStatus,
    enrollmentSubmitStatus,
  ].includes(APIResponseStatus.InProgress);

  const isPreviewStepActive = activeStep === PublicEnrollmentFormStep.Preview;
  const isPreviewPassed = activeStep > PublicEnrollmentFormStep.Preview;
  const hasReservation = !!reservation;

  const isEnrollmentToQueue =
    (activeStep === PublicEnrollmentFormStep.Authenticate &&
      !ExamEventUtils.hasOpenings(examEvent)) ||
    (activeStep > PublicEnrollmentFormStep.Authenticate && !hasReservation);

  const isShiftedFromQueue =
    enrollment.status === EnrollmentStatus.SHIFTED_FROM_QUEUE;

  const isPaymentSumAvailable =
    isPreviewStepActive && (hasReservation || isShiftedFromQueue);

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
          isPaymentSumAvailable={isPaymentSumAvailable}
          isPreviewStepActive={isPreviewStepActive}
          isPreviewPassed={isPreviewPassed}
          isEnrollmentToQueue={isEnrollmentToQueue}
          setShowValidation={setShowValidation}
          setIsStepValid={setIsStepValid}
          showValidation={showValidation}
          activeStep={activeStep}
          examEvent={examEvent}
        />
      ) : (
        <PublicEnrollmentDesktopGrid
          isStepValid={isStepValid}
          isLoading={isLoading}
          isShiftedFromQueue={isShiftedFromQueue}
          isPaymentSumAvailable={isPaymentSumAvailable}
          isPreviewStepActive={isPreviewStepActive}
          isPreviewPassed={isPreviewPassed}
          isEnrollmentToQueue={isEnrollmentToQueue}
          setShowValidation={setShowValidation}
          setIsStepValid={setIsStepValid}
          showValidation={showValidation}
          activeStep={activeStep}
          examEvent={examEvent}
        />
      )}
    </Grid>
  );
};
