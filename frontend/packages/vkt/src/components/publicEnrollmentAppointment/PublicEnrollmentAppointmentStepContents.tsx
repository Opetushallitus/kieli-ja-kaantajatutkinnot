import { Authenticate } from 'components/publicEnrollmentAppointment/steps/Authenticate';
import { FillContactDetails } from 'components/publicEnrollmentAppointment/steps/FillContactDetails';
import { Preview } from 'components/publicEnrollmentAppointment/steps/Preview';
import { PublicEnrollmentAppointmentFormStep } from 'enums/publicEnrollment';

export const PublicEnrollmentAppointmentStepContents = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentAppointmentFormStep;
}) => {
  switch (activeStep) {
    case PublicEnrollmentAppointmentFormStep.Authenticate:
      return <Authenticate />;
    case PublicEnrollmentAppointmentFormStep.FillContactDetails:
      return <FillContactDetails isLoading={false} />;
    case PublicEnrollmentAppointmentFormStep.Preview:
      return <Preview isLoading={false} />;
  }
};
