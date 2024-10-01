import { Authenticate } from 'components/publicEnrollmentAppointment/steps/Authenticate';
import { FillContactDetails } from 'components/publicEnrollmentAppointment/steps/FillContactDetails';
import { Preview } from 'components/publicEnrollmentAppointment/steps/Preview';
import { PublicEnrollmentAppointmentFormStep } from 'enums/publicEnrollment';
import { PublicEnrollmentAppointment } from 'interfaces/publicEnrollment';

export const PublicEnrollmentAppointmentStepContents = ({
  activeStep,
  enrollment,
  setIsStepValid,
  showValidation,
}: {
  activeStep: PublicEnrollmentAppointmentFormStep;
  enrollment: PublicEnrollmentAppointment;
  setIsStepValid: (isValid: boolean) => void;
  showValidation: boolean;
}) => {
  switch (activeStep) {
    case PublicEnrollmentAppointmentFormStep.Authenticate:
      return <Authenticate enrollment={enrollment} />;
    case PublicEnrollmentAppointmentFormStep.FillContactDetails:
      return (
        <FillContactDetails
          enrollment={enrollment}
          isLoading={false}
          setIsStepValid={setIsStepValid}
          showValidation={showValidation}
        />
      );
    case PublicEnrollmentAppointmentFormStep.Preview:
      return <Preview enrollment={enrollment} isLoading={false} />;
  }
};
