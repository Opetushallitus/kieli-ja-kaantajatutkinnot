import { FillContactDetails } from 'components/publicEnrollment/steps/FillContactDetails';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';

export const PublicEnrollmentStepContents = ({
  activeStep,
  isLoading,
  disableNext,
}: {
  activeStep: PublicEnrollmentFormStep;
  isLoading: boolean;
  disableNext: (disabled: boolean) => void;
}) => {
  switch (activeStep) {
    case PublicEnrollmentFormStep.Identify:
      return <></>;
    case PublicEnrollmentFormStep.FillContactDetails:
      return (
        <FillContactDetails isLoading={isLoading} disableNext={disableNext} />
      );
    case PublicEnrollmentFormStep.SelectExam:
      return <></>;
    case PublicEnrollmentFormStep.Preview:
      return <></>;
    case PublicEnrollmentFormStep.Pay:
      return <></>;
    default:
      return <> </>;
  }
};
