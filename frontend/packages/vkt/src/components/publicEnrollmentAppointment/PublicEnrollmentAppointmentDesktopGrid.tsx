import { Grid, Paper } from '@mui/material';
import { LoadingProgressIndicator } from 'shared/components';

import { PublicEnrollmentAppointmentControlButtons } from 'components/publicEnrollmentAppointment/PublicEnrollmentAppointmentControlButtons';
import { PublicEnrollmentAppointmentPaymentSum } from 'components/publicEnrollmentAppointment/PublicEnrollmentAppointmentPaymentSum';
import { PublicEnrollmentAppointmentStepContents } from 'components/publicEnrollmentAppointment/PublicEnrollmentAppointmentStepContents';
import { PublicEnrollmentAppointmentStepHeading } from 'components/publicEnrollmentAppointment/PublicEnrollmentAppointmentStepHeading';
import { PublicEnrollmentAppointmentStepper } from 'components/publicEnrollmentAppointment/PublicEnrollmentAppointmentStepper';
import { useCommonTranslation } from 'configs/i18n';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { PublicEnrollmentAppointment } from 'interfaces/publicEnrollment';

export const PublicEnrollmentAppointmentDesktopGrid = ({
  activeStep,
  enrollment,
}: {
  activeStep: PublicEnrollmentFormStep;
  enrollment: PublicEnrollmentAppointment;
}) => {
  const translateCommon = useCommonTranslation();

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
              />
              {activeStep > PublicEnrollmentFormStep.Authenticate && (
                <PublicEnrollmentAppointmentPaymentSum />
              )}
              {activeStep > PublicEnrollmentFormStep.Authenticate && (
                <PublicEnrollmentAppointmentControlButtons
                  activeStep={activeStep}
                />
              )}
            </div>
          </LoadingProgressIndicator>
        </Paper>
      </Grid>
    </>
  );
};
