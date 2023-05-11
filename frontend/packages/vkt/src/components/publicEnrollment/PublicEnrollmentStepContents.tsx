import { Authenticate } from 'components/publicEnrollment/steps/Authenticate';
import { Done } from 'components/publicEnrollment/steps/Done';
import { FillContactDetails } from 'components/publicEnrollment/steps/FillContactDetails';
import { Preview } from 'components/publicEnrollment/steps/Preview';
import { SelectExam } from 'components/publicEnrollment/steps/SelectExam';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';

export const PublicEnrollmentStepContents = ({
  activeStep,
  enrollment,
  isLoading,
  setIsStepValid,
  showValidation,
}: {
  activeStep: PublicEnrollmentFormStep;
  enrollment: PublicEnrollment;
  isLoading: boolean;
  setIsStepValid: (isValid: boolean) => void;
  showValidation: boolean;
}) => {
  switch (activeStep) {
    case PublicEnrollmentFormStep.Authenticate:
      return <Authenticate isLoading={isLoading} />;
    case PublicEnrollmentFormStep.FillContactDetails:
      return (
        <FillContactDetails
          enrollment={enrollment}
          isLoading={isLoading}
          setIsStepValid={setIsStepValid}
          showValidation={showValidation}
        />
      );
    case PublicEnrollmentFormStep.SelectExam:
      return (
        <SelectExam
          enrollment={enrollment}
          isLoading={isLoading}
          setIsStepValid={setIsStepValid}
          showValidation={showValidation}
        />
      );
    case PublicEnrollmentFormStep.Preview:
      return (
        <Preview
          enrollment={enrollment}
          isLoading={isLoading}
          setIsStepValid={setIsStepValid}
        />
      );
    case PublicEnrollmentFormStep.PaymentSuccess:
      return <></>;
    case PublicEnrollmentFormStep.Done:
      return <Done enrollment={enrollment} />;
    default:
      return <> </>;
  }
};
