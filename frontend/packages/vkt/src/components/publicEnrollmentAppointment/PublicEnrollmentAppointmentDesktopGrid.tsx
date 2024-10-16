import { Grid, Paper } from '@mui/material';
import { LoadingProgressIndicator } from 'shared/components';

import { PublicEnrollmentAppointmentControlButtons } from 'components/publicEnrollmentAppointment/PublicEnrollmentAppointmentControlButtons';
import { PublicEnrollmentAppointmentPaymentSum } from 'components/publicEnrollmentAppointment/PublicEnrollmentAppointmentPaymentSum';
import { PublicEnrollmentAppointmentStepContents } from 'components/publicEnrollmentAppointment/PublicEnrollmentAppointmentStepContents';
import { PublicEnrollmentAppointmentStepHeading } from 'components/publicEnrollmentAppointment/PublicEnrollmentAppointmentStepHeading';
import { PublicEnrollmentAppointmentStepper } from 'components/publicEnrollmentAppointment/PublicEnrollmentAppointmentStepper';
import { useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PublicEnrollmentAppointmentFormStep } from 'enums/publicEnrollment';
import { PublicEnrollmentAppointment } from 'interfaces/publicEnrollment';
import { publicEnrollmentAppointmentSelector } from 'redux/selectors/publicEnrollmentAppointment';

export const PublicEnrollmentAppointmentDesktopGrid = ({
  activeStep,
  enrollment,
  isStepValid,
  setIsStepValid,
  setShowValidation,
}: {
  activeStep: PublicEnrollmentAppointmentFormStep;
  isStepValid: boolean;
  enrollment: PublicEnrollmentAppointment;
  setIsStepValid: (isValid: boolean) => void;
  setShowValidation: (showValidation: boolean) => void;
}) => {
  const translateCommon = useCommonTranslation();

  const { enrollmentSubmitStatus } = useAppSelector(
    publicEnrollmentAppointmentSelector,
  );

  const showPaymentSum =
    activeStep === PublicEnrollmentAppointmentFormStep.Preview;
  const showControlButtons =
    activeStep > PublicEnrollmentAppointmentFormStep.Authenticate &&
    activeStep <= PublicEnrollmentAppointmentFormStep.Preview;

  return (
    <>
      <Grid className="public-enrollment__grid" item>
        <Paper elevation={3}>
          <LoadingProgressIndicator
            isLoading={false}
            translateCommon={translateCommon}
            displayBlock={true}
          >
            <div className={'public-enrollment__grid__form-container'}>
              <PublicEnrollmentAppointmentStepper activeStep={activeStep} />
              <PublicEnrollmentAppointmentStepHeading activeStep={activeStep} />
              <PublicEnrollmentAppointmentStepContents
                activeStep={activeStep}
                enrollment={enrollment}
                setIsStepValid={setIsStepValid}
              />
              {showPaymentSum && <PublicEnrollmentAppointmentPaymentSum />}
              {showControlButtons && (
                <PublicEnrollmentAppointmentControlButtons
                  activeStep={activeStep}
                  enrollment={enrollment}
                  setShowValidation={setShowValidation}
                  isStepValid={isStepValid}
                  submitStatus={enrollmentSubmitStatus}
                />
              )}
            </div>
          </LoadingProgressIndicator>
        </Paper>
      </Grid>
    </>
  );
};
