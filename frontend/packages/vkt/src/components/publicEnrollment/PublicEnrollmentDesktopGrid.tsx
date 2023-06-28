import { Grid, Paper } from '@mui/material';
import { LoadingProgressIndicator } from 'shared/components';

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
  selectedExamEvent,
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
  selectedExamEvent: PublicExamEvent;
}) => {
  const { enrollmentSubmitStatus, enrollment, reservationDetails } =
    useAppSelector(publicEnrollmentSelector);
  const translateCommon = useCommonTranslation();

  return (
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
                  includePaymentStep={ExamEventUtils.hasOpenings(
                    selectedExamEvent
                  )}
                />
              )}
              {reservationDetails?.reservation && !isPreviewPassed && (
                <PublicEnrollmentTimer
                  reservation={reservationDetails.reservation}
                  isLoading={isLoading}
                />
              )}
              <PublicEnrollmentStepHeading
                activeStep={activeStep}
                isEnrollmentToQueue={isEnrollmentToQueue}
              />
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
              {isPaymentSumAvailable && (
                <PublicEnrollmentPaymentSum enrollment={enrollment} />
              )}
              {activeStep > PublicEnrollmentFormStep.Authenticate &&
                !isPreviewPassed &&
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
          </LoadingProgressIndicator>
        </Paper>
      </Grid>
    </>
  );
};
