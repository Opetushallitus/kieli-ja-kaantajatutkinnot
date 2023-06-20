import { Grid, Paper } from '@mui/material';
import { LoadingProgressIndicator } from 'shared/components';

import { PublicEnrollmentControlButtons } from 'components/publicEnrollment/PublicEnrollmentControlButtons';
import { PublicEnrollmentExamEventDetails } from 'components/publicEnrollment/PublicEnrollmentExamEventDetails';
import { PublicEnrollmentPaymentSum } from 'components/publicEnrollment/PublicEnrollmentPaymentSum';
import { PublicEnrollmentStepContents } from 'components/publicEnrollment/PublicEnrollmentStepContents';
import { PublicEnrollmentStepper } from 'components/publicEnrollment/PublicEnrollmentStepper';
import { PublicEnrollmentTimer } from 'components/publicEnrollment/PublicEnrollmentTimer';
import { useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { ExamEventUtils } from 'utils/examEvent';

export const PublicEnrollmentDesktopGrid = ({
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
  const {
    enrollmentSubmitStatus,
    enrollment,
    reservationDetails,
    selectedExamEvent,
  } = useAppSelector(publicEnrollmentSelector);
  const translateCommon = useCommonTranslation();
  const hasReservation = !!reservationDetails?.reservation;

  return (
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
                    includePaymentStep={ExamEventUtils.hasOpenings(
                      selectedExamEvent
                    )}
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
};
