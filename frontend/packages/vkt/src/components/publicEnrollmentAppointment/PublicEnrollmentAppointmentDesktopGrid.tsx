import { Grid, Paper } from '@mui/material';
import { LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { PublicEnrollmentAppointmentControlButtons } from 'components/publicEnrollment/PublicEnrollmentAppointmentControlButtons';
import { PublicEnrollmentAppointmentPaymentSum } from 'components/publicEnrollment/PublicEnrollmentAppointmentPaymentSum';
import { PublicEnrollmentAppointmentStepContents } from 'components/publicEnrollment/PublicEnrollmentAppointmentStepContents';
import { PublicEnrollmentAppointmentStepHeading } from 'components/publicEnrollmentAppointment/PublicEnrollmentAppointmentStepHeading';
import { PublicEnrollmentAppointmentStepper } from 'components/publicEnrollmentAppointment/PublicEnrollmentAppointmentStepper';
import { useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { ExamEventUtils } from 'utils/examEvent';

export const PublicEnrollmentAppointmentDesktopGrid = ({
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
    freeEnrollmentDetails,
  } = useAppSelector(publicEnrollmentSelector);

  const isRenewOrCancelLoading = [
    renewReservationStatus,
    cancelStatus,
  ].includes(APIResponseStatus.InProgress);

  const isEnrollmentSubmitLoading =
    enrollmentSubmitStatus === APIResponseStatus.InProgress;

  const includePaymentStep =
    ExamEventUtils.hasOpenings(examEvent) && !enrollment.isFree;

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
              <PublicEnrollmentAppointmentStepper
                activeStep={activeStep}
                includePaymentStep={includePaymentStep}
              />
              <PublicEnrollmentAppointmentStepHeading
                activeStep={activeStep}
                isEnrollmentToQueue={isEnrollmentToQueue}
              />
              <PublicEnrollmentAppointmentStepContents
                examEvent={examEvent}
                activeStep={activeStep}
                enrollment={enrollment}
                isRenewOrCancelLoading={isRenewOrCancelLoading}
                isEnrollmentSubmitLoading={isEnrollmentSubmitLoading}
                setIsStepValid={setIsStepValid}
                showValidation={showValidation}
              />
              {isPaymentSumAvailable && (
                <PublicEnrollmentAppointmentPaymentSum
                  enrollment={enrollment}
                  freeEnrollmentDetails={freeEnrollmentDetails}
                />
              )}
              {activeStep > PublicEnrollmentFormStep.Authenticate &&
                !isPreviewPassed && (
                  <PublicEnrollmentAppointmentControlButtons
                    isEnrollmentToQueue={isEnrollmentToQueue}
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
