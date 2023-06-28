import { Warning } from '@mui/icons-material';
import { Grid, Paper, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import {
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
import { PublicExamEvent } from 'interfaces/publicExamEvent';
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
  examEvent,
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
  examEvent: PublicExamEvent;
}) => {
  const [appBarState, setAppBarState] = useState<MobileAppBarState>({});
  const { enrollmentSubmitStatus, enrollment, reservation } = useAppSelector(
    publicEnrollmentSelector
  );
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.stepHeading',
  });

  const memoizedSetAppBarState = useCallback(
    (order: number, height: number) =>
      setAppBarState((prev) => ({
        ...prev,
        [order]: height,
      })),
    []
  );

  const getMobileStepperHeading = () => {
    switch (activeStep) {
      case PublicEnrollmentFormStep.PaymentFail: {
        return (
          <div className="columns gapped-xxs">
            <Warning color="error" />
            <Typography component="h1" variant="h2">
              {t(`common.${PublicEnrollmentFormStep[activeStep]}`)}!
            </Typography>
          </div>
        );
      }
      case PublicEnrollmentFormStep.PaymentSuccess:
      case PublicEnrollmentFormStep.Done: {
        return (
          <>
            <Typography component="h1" variant="h2">
              {t(`common.${PublicEnrollmentFormStep[activeStep]}`)}!
            </Typography>
          </>
        );
      }

      default: {
        const nextStepIndex = PublicEnrollmentUtils.getEnrollmentNextStep(
          activeStep,
          ExamEventUtils.hasOpenings(examEvent)
        );

        return (
          <>
            <Typography component="h1" variant="h2">
              {t(`common.${PublicEnrollmentFormStep[activeStep]}`)}
            </Typography>
            <div>
              <Text>
                {translateCommon('next')}
                {': '}
                {t(`common.${PublicEnrollmentFormStep[nextStepIndex]}`)}
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
          <LoadingProgressIndicator
            translateCommon={translateCommon}
            isLoading={isLoading}
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
                <div className="columns gapped-xxl">
                  <PublicEnrollmentStepper
                    activeStep={activeStep}
                    includePaymentStep={ExamEventUtils.hasOpenings(examEvent)}
                  />
                  <div className="rows gapped-xs grow">
                    {getMobileStepperHeading()}
                  </div>
                </div>
              )}
              <div className="margin-top-lg">
                <PublicEnrollmentExamEventDetails
                  examEvent={examEvent}
                  showOpenings={!isPreviewPassed && !isShiftedFromQueue}
                  isEnrollmentToQueue={isEnrollmentToQueue}
                />
              </div>
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
          !isPreviewPassed &&
          reservation && (
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
