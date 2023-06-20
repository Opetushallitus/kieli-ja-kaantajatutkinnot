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
  isAuthenticateStepActive,
  isPreviewStepActive,
  isDoneStepActive,
  showValidation,
  setIsStepValid,
  setShowValidation,
}: {
  activeStep: PublicEnrollmentFormStep;
  isLoading: boolean;
  isStepValid: boolean;
  isPaymentSumAvailable: boolean;
  isAuthenticateStepActive: boolean;
  isPreviewStepActive: boolean;
  isShiftedFromQueue: boolean;
  isDoneStepActive: boolean;
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

  return (
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
                  <div className="columns gapped">
                    <PublicEnrollmentStepper
                      activeStep={activeStep}
                      includePaymentStep={ExamEventUtils.hasOpenings(
                        selectedExamEvent
                      )}
                    />
                    <div className="rows gapped-xs align-items-center grow">
                      <H2>
                        {t(`step.${PublicEnrollmentFormStep[activeStep]}`)}
                      </H2>
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
        {!isDoneStepActive &&
          !isAuthenticateStepActive &&
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
