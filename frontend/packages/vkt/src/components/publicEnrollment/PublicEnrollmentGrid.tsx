import { Grid, Paper } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  H2,
  LoadingProgressIndicator,
  StackableMobileAppBar,
  Text,
} from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';
import { MobileAppBarState } from 'shared/interfaces';

import { PublicEnrollmentControlButtons } from 'components/publicEnrollment/PublicEnrollmentControlButtons';
import { PublicEnrollmentExamEventDetails } from 'components/publicEnrollment/PublicEnrollmentExamEventDetails';
import { PublicEnrollmentPaymentSum } from 'components/publicEnrollment/PublicEnrollmentPaymentSum';
import { PublicEnrollmentStepContents } from 'components/publicEnrollment/PublicEnrollmentStepContents';
import { PublicEnrollmentStepHeading } from 'components/publicEnrollment/PublicEnrollmentStepHeading';
import { PublicEnrollmentStepper } from 'components/publicEnrollment/PublicEnrollmentStepper';
import { PublicEnrollmentTimer } from 'components/publicEnrollment/PublicEnrollmentTimer';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
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
import { PublicEnrollmentUtils } from 'utils/publicEnrollment';

export const PublicEnrollmentGrid = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentFormStep;
}) => {
  // State
  const [isStepValid, setIsStepValid] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [appBarState, setAppBarState] = useState<MobileAppBarState>({});

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

  // i18n
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.stepper',
  });

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

  const memoizedSetAppBarState = useCallback(
    (order: number, height: number) =>
      setAppBarState((prev) => ({
        ...prev,
        [order]: height,
      })),
    []
  );

  if (!examEvent) {
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

  const getNextEnrollmentStep = () => {
    const steps = PublicEnrollmentUtils.getEnrollmentSteps(hasReservation);
    const currentIndex = steps.findIndex((step) => step === activeStep);

    return steps[currentIndex + 1];
  };

  const renderPhoneView = () => (
    <>
      <Grid className="public-enrollment__grid" item>
        {!isPreviewPassed && (
          <StackableMobileAppBar
            order={1}
            state={appBarState}
            setState={memoizedSetAppBarState}
          >
            <div className="rows">
              {reservation && !isPreviewPassed && (
                <PublicEnrollmentTimer
                  reservation={reservation}
                  isLoading={isLoading}
                />
              )}
              {isPaymentSumAvailable && (
                <PublicEnrollmentPaymentSum enrollment={enrollment} />
              )}
            </div>
          </StackableMobileAppBar>
        )}
        <Paper elevation={3}>
          <LoadingProgressIndicator isLoading={isLoading} displayBlock={true}>
            <div
              className={
                isLoading
                  ? 'dimmed public-enrollment__grid__form-container'
                  : 'public-enrollment__grid__form-container'
              }
            >
              {!isShiftedFromQueue && (
                <div className="columns gapped">
                  <PublicEnrollmentStepper
                    activeStep={activeStep}
                    includePaymentStep={hasReservation}
                  />
                  <div className="rows gapped-xs align-items-center grow">
                    <H2>{t(`step.${PublicEnrollmentFormStep[activeStep]}`)}</H2>
                    <div>
                      <Text>
                        {translateCommon('next')}
                        {': '}
                        {t(
                          `step.${
                            PublicEnrollmentFormStep[getNextEnrollmentStep()]
                          }`
                        )}
                      </Text>
                    </div>
                  </div>
                </div>
              )}
              <PublicEnrollmentStepHeading
                activeStep={activeStep}
                isEnrollmentToQueue={isEnrollmentToQueue}
              />
              <PublicEnrollmentExamEventDetails
                examEvent={examEvent}
                showOpenings={!isPreviewPassed && !isShiftedFromQueue}
                isEnrollmentToQueue={isEnrollmentToQueue}
              />
              <PublicEnrollmentStepContents
                examEvent={examEvent}
                activeStep={activeStep}
                enrollment={enrollment}
                isLoading={isLoading}
                setIsStepValid={setIsStepValid}
                showValidation={showValidation}
              />
            </div>
          </LoadingProgressIndicator>
        </Paper>
        {activeStep > PublicEnrollmentFormStep.Authenticate &&
          !isPreviewPassed && (
            <StackableMobileAppBar
              order={2}
              state={appBarState}
              setState={memoizedSetAppBarState}
            >
              <div className="rows">
                <PublicEnrollmentControlButtons
                  submitStatus={enrollmentSubmitStatus}
                  examEvent={examEvent}
                  activeStep={activeStep}
                  enrollment={enrollment}
                  reservation={reservation}
                  isLoading={isLoading}
                  isStepValid={isStepValid}
                  setShowValidation={setShowValidation}
                  isPaymentLinkPreviewView={
                    isShiftedFromQueue && isPreviewStepActive
                  }
                />
              </div>
            </StackableMobileAppBar>
          )}
      </Grid>
    </>
  );

  const renderDesktopView = () => (
    <>
      <Grid className="public-enrollment__grid" item>
        <Paper elevation={3}>
          <LoadingProgressIndicator
            isLoading={isLoading}
            translateCommon={translateCommon}
            displayBlock={true}
          >
            <div
              className={
                isLoading
                  ? 'dimmed public-enrollment__grid__form-container'
                  : 'public-enrollment__grid__form-container'
              }
            >
              {!isShiftedFromQueue && (
                <PublicEnrollmentStepper
                  activeStep={activeStep}
                  includePaymentStep={hasReservation}
                />
              )}
              {reservation && !isPreviewPassed && (
                <PublicEnrollmentTimer
                  reservation={reservation}
                  isLoading={isLoading}
                />
              )}
              <PublicEnrollmentStepHeading
                activeStep={activeStep}
                isEnrollmentToQueue={isEnrollmentToQueue}
              />
              <PublicEnrollmentExamEventDetails
                examEvent={examEvent}
                showOpenings={!isPreviewPassed && !isShiftedFromQueue}
                isEnrollmentToQueue={isEnrollmentToQueue}
              />
              <PublicEnrollmentStepContents
                examEvent={examEvent}
                activeStep={activeStep}
                enrollment={enrollment}
                isLoading={isLoading}
                setIsStepValid={setIsStepValid}
                showValidation={showValidation}
              />
              {isPaymentSumAvailable && (
                <PublicEnrollmentPaymentSum enrollment={enrollment} />
              )}
              {activeStep > PublicEnrollmentFormStep.Authenticate &&
                !isPreviewPassed && (
                  <PublicEnrollmentControlButtons
                    submitStatus={enrollmentSubmitStatus}
                    examEvent={examEvent}
                    activeStep={activeStep}
                    enrollment={enrollment}
                    reservation={reservation}
                    isLoading={isLoading}
                    isStepValid={isStepValid}
                    setShowValidation={setShowValidation}
                    isPaymentLinkPreviewView={
                      isShiftedFromQueue && isPreviewStepActive
                    }
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
      {isPhone ? renderPhoneView() : renderDesktopView()}
    </Grid>
  );
};
