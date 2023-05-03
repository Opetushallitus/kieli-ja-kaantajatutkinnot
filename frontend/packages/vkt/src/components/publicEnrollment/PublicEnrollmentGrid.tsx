import { Grid, Paper } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { H2, LoadingProgressIndicator, Text } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { StackableMobileAppBar } from 'components/common/StackableMobileAppBar';
import { PublicEnrollmentControlButtons } from 'components/publicEnrollment/PublicEnrollmentControlButtons';
import { PublicEnrollmentExamEventDetails } from 'components/publicEnrollment/PublicEnrollmentExamEventDetails';
import { PublicEnrollmentPaymentSum } from 'components/publicEnrollment/PublicEnrollmentPaymentSum';
import { PublicEnrollmentStepContents } from 'components/publicEnrollment/PublicEnrollmentStepContents';
import { PublicEnrollmentStepper } from 'components/publicEnrollment/PublicEnrollmentStepper';
import { PublicEnrollmentTimer } from 'components/publicEnrollment/PublicEnrollmentTimer';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, EnrollmentStatus } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { MobileAppBarState } from 'interfaces/mobileAppBar';
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
  const [appBarState, setAppBarState] = useState<MobileAppBarState>({});

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
    '/vkt/ilmoittaudu'
  );

  const memoizedSetAppBarState = useCallback(
    (order: number, height: number) =>
      setAppBarState((prev) => ({
        ...prev,
        [order]: height,
      })),
    []
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
  const hasReservation = !!reservationDetails?.reservation;

  const isShiftedFromQueue =
    enrollment.status === EnrollmentStatus.SHIFTED_FROM_QUEUE;

  const isPaymentSumAvailable =
    isPreviewStepActive &&
    (reservationDetails?.reservation || isShiftedFromQueue);

  const renderPhoneView = () => (
    <>
      <Grid className="public-enrollment__grid" item>
        {!isDoneStepActive && (
          <StackableMobileAppBar
            order={1}
            state={appBarState}
            setState={memoizedSetAppBarState}
          >
            <div className="rows">
              {reservationDetails?.reservation && !isDoneStepActive && (
                <PublicEnrollmentTimer
                  reservation={reservationDetails.reservation}
                  isLoading={isLoading}
                />
              )}
              {isPreviewStepActive && reservationDetails?.reservation && (
                <PublicEnrollmentPaymentSum enrollment={enrollment} />
              )}
            </div>
          </StackableMobileAppBar>
        )}
        <Paper elevation={3}>
          <LoadingProgressIndicator isLoading={isLoading} displayBlock={true}>
            {selectedExamEvent && (
              <div className="public-enrollment__grid__form-container">
                <div className="columns gapped">
                  <PublicEnrollmentStepper
                    activeStep={activeStep}
                    includePaymentStep={hasReservation}
                  />
                  <div className="rows gapped-xs align-items-center grow">
                    <H2>{t(`step.${PublicEnrollmentFormStep[activeStep]}`)}</H2>
                    <div>
                      <Text>
                        Seuraava:{' '}
                        {t(`step.${PublicEnrollmentFormStep[activeStep + 1]}`)}
                      </Text>
                    </div>
                  </div>
                </div>
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
                />
              </div>
            )}
          </LoadingProgressIndicator>
        </Paper>
        {!isDoneStepActive && reservationDetails && (
          <StackableMobileAppBar
            order={2}
            state={appBarState}
            setState={memoizedSetAppBarState}
          >
            <div className="rows">
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
            {selectedExamEvent && (
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
                />
                {isPaymentSumAvailable && (
                  <PublicEnrollmentPaymentSum enrollment={enrollment} />
                )}
                {!isDoneStepActive &&
                  !isAuthenticateStepActive &&
                  reservationDetails && (
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
      {isPhone ? renderPhoneView() : renderDesktopView()}
    </Grid>
  );
};
