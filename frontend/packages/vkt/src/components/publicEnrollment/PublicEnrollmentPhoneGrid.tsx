import WarningIcon from '@mui/icons-material/Warning';
import { Grid, Paper } from '@mui/material';
import { useCallback, useState } from 'react';
import {
  H2,
  LoadingProgressIndicator,
  StackableMobileAppBar,
  Text,
} from 'shared/components';
import { MobileAppBarState } from 'shared/interfaces';

import { PublicEnrollmentControlButtons } from 'components/publicEnrollment/PublicEnrollmentControlButtons';
import { PublicEnrollmentExamEventDetails } from 'components/publicEnrollment/PublicEnrollmentExamEventDetails';
import { PublicEnrollmentPaymentSum } from 'components/publicEnrollment/PublicEnrollmentPaymentSum';
import { PublicEnrollmentStepContents } from 'components/publicEnrollment/PublicEnrollmentStepContents';
import { PublicEnrollmentStepper } from 'components/publicEnrollment/PublicEnrollmentStepper';
import { PublicEnrollmentTimer } from 'components/publicEnrollment/PublicEnrollmentTimer';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { ExamEventUtils } from 'utils/examEvent';
import { PublicEnrollmentUtils } from 'utils/publicEnrollment';

export const PublicEnrollmentPhoneGrid = ({
  activeStep,
  isLoading,
  isStepValid,
  isShiftedFromQueue,
  isPaymentSumAvailable,
  isPreviewStepActive,
  isPreviewPassed,
  isEnrollmentToQueue,
  showValidation,
  setIsStepValid,
  setShowValidation,
}: {
  activeStep: PublicEnrollmentFormStep;
  isLoading: boolean;
  isStepValid: boolean;
  isPaymentSumAvailable: boolean;
  isPreviewStepActive: boolean;
  isShiftedFromQueue: boolean;
  isPreviewPassed: boolean;
  isEnrollmentToQueue: boolean;
  showValidation: boolean;
  setIsStepValid: (isValid: boolean) => void;
  setShowValidation: (showValidation: boolean) => void;
}) => {
  const [appBarState, setAppBarState] = useState<MobileAppBarState>({});
  const {
    enrollmentSubmitStatus,
    enrollment,
    reservationDetails,
    selectedExamEvent,
  } = useAppSelector(publicEnrollmentSelector);
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.stepper',
  });

  const memoizedSetAppBarState = useCallback(
    (order: number, height: number) =>
      setAppBarState((prev) => ({
        ...prev,
        [order]: height,
      })),
    []
  );

  const hasReservation = !!reservationDetails?.reservation;

  const getNextEnrollmentStep = () => {
    const steps = PublicEnrollmentUtils.getEnrollmentSteps(hasReservation);
    const currentIndex = steps.findIndex((step) => step === activeStep);

    return steps[currentIndex + 1];
  };

  const getMobileStepperContent = () => {
    switch (activeStep) {
      case PublicEnrollmentFormStep.PaymentFail: {
        return (
          <div className="columns gapped-xxs">
            <WarningIcon color="error" />
            <H2>{t(`step.${PublicEnrollmentFormStep[5]}`)}!</H2>
          </div>
        );
      }
      case PublicEnrollmentFormStep.PaymentSuccess:
      case PublicEnrollmentFormStep.Done: {
        return (
          <>
            <H2>{t(`step.${PublicEnrollmentFormStep[5]}`)}!</H2>
          </>
        );
      }

      default: {
        return (
          <>
            <H2>{t(`step.${PublicEnrollmentFormStep[activeStep]}`)}</H2>
            <div>
              <Text>
                {translateCommon('next')}
                {': '}
                {t(`step.${PublicEnrollmentFormStep[getNextEnrollmentStep()]}`)}
              </Text>
            </div>
          </>
        );
      }
    }
  };

  return (
    <>
      <Grid className="public-enrollment__grid" item>
        {!isPreviewPassed && (
          <StackableMobileAppBar
            order={1}
            state={appBarState}
            setState={memoizedSetAppBarState}
          >
            <div className="rows">
              {reservationDetails?.reservation && !isPreviewPassed && (
                <PublicEnrollmentTimer
                  reservation={reservationDetails.reservation}
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
            {selectedExamEvent && (
              <div
                className={
                  isLoading
                    ? 'dimmed public-enrollment__grid__form-container'
                    : 'public-enrollment__grid__form-container'
                }
              >
                {!isShiftedFromQueue && (
                  <div className="columns gapped-xxl">
                    <PublicEnrollmentStepper
                      activeStep={activeStep}
                      includePaymentStep={ExamEventUtils.hasOpenings(
                        selectedExamEvent
                      )}
                    />
                    <div className="rows gapped-xs grow">
                      {getMobileStepperContent()}
                    </div>
                  </div>
                )}
                <PublicEnrollmentExamEventDetails
                  examEvent={selectedExamEvent}
                  showOpenings={!isPreviewPassed && !isShiftedFromQueue}
                  isEnrollmentToQueue={isEnrollmentToQueue}
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
        {activeStep > PublicEnrollmentFormStep.Authenticate &&
          !isPreviewPassed &&
          reservationDetails && (
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
};
