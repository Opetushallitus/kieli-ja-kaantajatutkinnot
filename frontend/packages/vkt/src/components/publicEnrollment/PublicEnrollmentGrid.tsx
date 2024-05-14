import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { SessionExpiredModal } from 'components/layouts/SessionExpiredModal';
import { PublicEnrollmentDesktopGrid } from 'components/publicEnrollment/PublicEnrollmentDesktopGrid';
import { PublicEnrollmentPhoneGrid } from 'components/publicEnrollment/PublicEnrollmentPhoneGrid';
import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, EnrollmentStatus } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { useAuthentication } from 'hooks/useAuthentication';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import {
  loadEnrollmentInitialisation,
  loadPublicExamEvent,
  resetPublicEnrollment,
  setPublicEnrollmentExamEventIdIfNotSet,
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
  const { publicUser } = useAuthentication();

  // Redux
  const dispatch = useAppDispatch();
  const {
    loadExamEventStatus,
    enrollmentInitialisationStatus,
    cancelStatus,
    enrollment,
    examEvent,
    reservation,
  } = useAppSelector(publicEnrollmentSelector);

  const navigate = useNavigate();
  const params = useParams();
  const { isPhone } = useWindowProperties();

  const isAuthenticatePassed =
    activeStep > PublicEnrollmentFormStep.Authenticate;
  const isAuthenticateActive = !isAuthenticatePassed;

  const isAuthenticationValid =
    !isAuthenticatePassed ||
    publicUser.status === APIResponseStatus.NotStarted ||
    publicUser.status === APIResponseStatus.InProgress ||
    publicUser.isAuthenticated;

  useEffect(() => {
    if (params.examEventId) {
      dispatch(setPublicEnrollmentExamEventIdIfNotSet(+params.examEventId));
    }
  }, [dispatch, params.examEventId]);

  useEffect(() => {
    if (
      isAuthenticateActive &&
      loadExamEventStatus === APIResponseStatus.NotStarted &&
      params.examEventId
    ) {
      dispatch(loadPublicExamEvent(+params.examEventId));
    }
  }, [dispatch, isAuthenticateActive, loadExamEventStatus, params.examEventId]);

  useEffect(() => {
    if (
      isAuthenticatePassed &&
      enrollmentInitialisationStatus === APIResponseStatus.NotStarted &&
      params.examEventId
    ) {
      dispatch(loadEnrollmentInitialisation(+params.examEventId));
    }
  }, [
    dispatch,
    isAuthenticatePassed,
    enrollmentInitialisationStatus,
    params.examEventId,
  ]);

  useEffect(() => {
    if (
      cancelStatus === APIResponseStatus.Success ||
      enrollmentInitialisationStatus === APIResponseStatus.Error
    ) {
      navigate(AppRoutes.PublicHomePage);
    }

    return () => {
      if (cancelStatus === APIResponseStatus.Success) {
        dispatch(resetPublicEnrollment());
      }
    };
  }, [cancelStatus, enrollmentInitialisationStatus, navigate, dispatch]);

  useNavigationProtection(
    isAuthenticatePassed &&
      activeStep < PublicEnrollmentFormStep.Preview &&
      cancelStatus === APIResponseStatus.NotStarted,
    AppRoutes.PublicEnrollment,
  );

  const isViewLoading =
    (isAuthenticateActive &&
      loadExamEventStatus !== APIResponseStatus.Success) ||
    (isAuthenticatePassed &&
      enrollmentInitialisationStatus !== APIResponseStatus.Success) ||
    !examEvent;

  if (isViewLoading) {
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

  const isEnrollmentToQueue =
    (isAuthenticateActive && !ExamEventUtils.hasOpenings(examEvent)) ||
    (isAuthenticatePassed && !reservation);

  const isShiftedFromQueue =
    enrollment.status === EnrollmentStatus.SHIFTED_FROM_QUEUE ||
    enrollment.hasPaymentLink;

  const isPreviewStepActive = activeStep === PublicEnrollmentFormStep.Preview;
  const isPreviewPassed = activeStep > PublicEnrollmentFormStep.Preview;

  const isExamEventDetailsAvailable =
    activeStep !== PublicEnrollmentFormStep.FillContactDetails;
  const isPaymentSumAvailable =
    isPreviewStepActive && (!!reservation || isShiftedFromQueue);

  return (
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="public-enrollment"
    >
      {!isAuthenticationValid && <SessionExpiredModal isClerkUI={false} />}
      {isPhone ? (
        <PublicEnrollmentPhoneGrid
          isStepValid={isStepValid}
          isShiftedFromQueue={isShiftedFromQueue}
          isExamEventDetailsAvailable={isExamEventDetailsAvailable}
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
          isShiftedFromQueue={isShiftedFromQueue}
          isExamEventDetailsAvailable={isExamEventDetailsAvailable}
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
