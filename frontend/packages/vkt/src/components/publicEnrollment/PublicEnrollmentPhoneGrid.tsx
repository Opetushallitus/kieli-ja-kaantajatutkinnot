import { Warning } from '@mui/icons-material';
import { Grid, Paper, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import {
  LoadingProgressIndicator,
  StackableMobileAppBar,
  Text,
} from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
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
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { ExamEventUtils } from 'utils/examEvent';
import { PublicEnrollmentUtils } from 'utils/publicEnrollment';

export const PublicEnrollmentPhoneGrid = ({
  activeStep,
  isStepValid,
  isShiftedFromQueue,
  isExamEventDetailsAvailable,
  isPaymentSumAvailable,
  isPreviewStepActive,
  isPreviewPassed,
  isEnrollmentToQueue,
  showValidation,
  setIsStepValid,
  setShowValidation,
  examEvent,
}: {
  activeStep: PublicEnrollmentFormStep;
  isStepValid: boolean;
  isExamEventDetailsAvailable: boolean;
  isPaymentSumAvailable: boolean;
  isPreviewStepActive: boolean;
  isShiftedFromQueue: boolean;
  isPreviewPassed: boolean;
  isEnrollmentToQueue: boolean;
  showValidation: boolean;
  setIsStepValid: (isValid: boolean) => void;
  setShowValidation: (showValidation: boolean) => void;
  examEvent: PublicExamEvent;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment',
  });
  const translateCommon = useCommonTranslation();

  const {
    enrollmentSubmitStatus,
    renewReservationStatus,
    cancelStatus,
    enrollment,
    reservation,
    freeEnrollmentDetails,
  } = useAppSelector(publicEnrollmentSelector);

  const isRenewOrCancelLoading = [
    renewReservationStatus,
    cancelStatus,
  ].includes(APIResponseStatus.InProgress);

  const isEnrollmentSubmitLoading =
    enrollmentSubmitStatus === APIResponseStatus.InProgress;

  const [appBarState, setAppBarState] = useState<MobileAppBarState>({});

  const includePaymentStep =
    ExamEventUtils.hasOpenings(examEvent) && !enrollment.isFree;

  const memoizedSetAppBarState = useCallback(
    (order: number, height: number) =>
      setAppBarState((prev) => ({
        ...prev,
        [order]: height,
      })),
    [],
  );

  const getMobileStepperHeading = () => {
    const heading = (
      <Typography component="p" variant="h2">
        {t(`stepHeading.common.${PublicEnrollmentFormStep[activeStep]}`)}
      </Typography>
    );

    if (
      activeStep === PublicEnrollmentFormStep.PaymentSuccess ||
      activeStep === PublicEnrollmentFormStep.Done ||
      activeStep === PublicEnrollmentFormStep.DoneQueued
    ) {
      return <>{heading}</>;
    }

    const nextStepIndex = PublicEnrollmentUtils.getEnrollmentNextStep(
      activeStep,
      includePaymentStep,
    );

    return (
      <>
        {activeStep === PublicEnrollmentFormStep.Payment ? (
          <div className="columns gapped-xxs">
            <Warning color="error" />
            {heading}
          </div>
        ) : (
          <>{heading}</>
        )}
        <div>
          <Text>
            {translateCommon('next')}
            {': '}
            {t(`stepper.step.${PublicEnrollmentFormStep[nextStepIndex]}`)}
          </Text>
        </div>
      </>
    );
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
              {reservation && !isPreviewPassed && (
                <PublicEnrollmentTimer
                  reservation={reservation}
                  isLoading={isRenewOrCancelLoading}
                />
              )}
              {isPaymentSumAvailable && (
                <PublicEnrollmentPaymentSum
                  enrollment={enrollment}
                  freeEnrollmentDetails={freeEnrollmentDetails}
                />
              )}
            </div>
          </StackableMobileAppBar>
        )}
        <Paper elevation={3}>
          <LoadingProgressIndicator
            isLoading={isRenewOrCancelLoading}
            translateCommon={translateCommon}
            displayBlock={false}
          >
            <div
              className={
                isRenewOrCancelLoading
                  ? 'dimmed public-enrollment__grid__form-container'
                  : 'public-enrollment__grid__form-container'
              }
            >
              <div className="columns gapped-xxl">
                <PublicEnrollmentStepper
                  activeStep={activeStep}
                  includePaymentStep={includePaymentStep}
                />
                <div className="rows gapped-xs grow">
                  {getMobileStepperHeading()}
                </div>
              </div>
              {isExamEventDetailsAvailable && (
                <div className="margin-top-lg">
                  <PublicEnrollmentExamEventDetails
                    examEvent={examEvent}
                    showOpenings={!isPreviewPassed && !isShiftedFromQueue}
                    isEnrollmentToQueue={isEnrollmentToQueue}
                  />
                </div>
              )}
              <PublicEnrollmentStepContents
                examEvent={examEvent}
                activeStep={activeStep}
                enrollment={enrollment}
                isRenewOrCancelLoading={isRenewOrCancelLoading}
                isEnrollmentSubmitLoading={isEnrollmentSubmitLoading}
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
                  activeStep={activeStep}
                  examEvent={examEvent}
                  enrollment={enrollment}
                  reservation={reservation}
                  isRenewOrCancelLoading={isRenewOrCancelLoading}
                  isEnrollmentSubmitLoading={isEnrollmentSubmitLoading}
                  isStepValid={isStepValid}
                  setShowValidation={setShowValidation}
                  isEnrollmentToQueue={isEnrollmentToQueue}
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
