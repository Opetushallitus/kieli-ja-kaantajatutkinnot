import { Grid, Paper } from '@mui/material';
import { LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { PublicEnrollmentControlButtons } from 'components/publicEnrollment/PublicEnrollmentControlButtons';
import { PublicEnrollmentExamEventDetails } from 'components/publicEnrollment/PublicEnrollmentExamEventDetails';
import { PublicEnrollmentPaymentSum } from 'components/publicEnrollment/PublicEnrollmentPaymentSum';
import { PublicEnrollmentStepContents } from 'components/publicEnrollment/PublicEnrollmentStepContents';
import { PublicEnrollmentStepHeading } from 'components/publicEnrollment/PublicEnrollmentStepHeading';
import { PublicEnrollmentStepper } from 'components/publicEnrollment/PublicEnrollmentStepper';
import { PublicEnrollmentTimer } from 'components/publicEnrollment/PublicEnrollmentTimer';
import { useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { ExamEventUtils } from 'utils/examEvent';

export const PublicEnrollmentDesktopGrid = ({
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
  const translateCommon = useCommonTranslation();

  const {
    enrollmentSubmitStatus,
    renewReservationStatus,
    cancelStatus,
    enrollment,
    reservation,
  } = useAppSelector(publicEnrollmentSelector);

  const isRenewOrCancelLoading = [
    renewReservationStatus,
    cancelStatus,
  ].includes(APIResponseStatus.InProgress);

  const isEnrollmentSubmitLoading =
    enrollmentSubmitStatus === APIResponseStatus.InProgress;

  return (
    <>
      <Grid className="public-enrollment__grid" item>
        <Paper elevation={3}>
          <LoadingProgressIndicator
            isLoading={isRenewOrCancelLoading}
            translateCommon={translateCommon}
            displayBlock={true}
          >
            <div
              className={
                isRenewOrCancelLoading
                  ? 'dimmed public-enrollment__grid__form-container'
                  : 'public-enrollment__grid__form-container'
              }
            >
              <PublicEnrollmentStepper
                activeStep={activeStep}
                includePaymentStep={ExamEventUtils.hasOpenings(examEvent)}
              />
              {reservation && !isPreviewPassed && (
                <PublicEnrollmentTimer
                  reservation={reservation}
                  isLoading={isRenewOrCancelLoading}
                />
              )}
              <PublicEnrollmentStepHeading
                activeStep={activeStep}
                isEnrollmentToQueue={isEnrollmentToQueue}
              />
              {isExamEventDetailsAvailable && (
                <PublicEnrollmentExamEventDetails
                  examEvent={examEvent}
                  showOpenings={!isPreviewPassed && !isShiftedFromQueue}
                  isEnrollmentToQueue={isEnrollmentToQueue}
                />
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
              {isPaymentSumAvailable && (
                <PublicEnrollmentPaymentSum enrollment={enrollment} />
              )}
              {activeStep > PublicEnrollmentFormStep.Authenticate &&
                !isPreviewPassed && (
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
};
