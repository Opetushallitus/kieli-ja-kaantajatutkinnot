import { Authenticate } from 'components/publicEnrollment/steps/Authenticate';
import { Done } from 'components/publicEnrollment/steps/Done';
import { FillContactDetails } from 'components/publicEnrollment/steps/FillContactDetails';
import { Preview } from 'components/publicEnrollment/steps/Preview';
import { SelectExam } from 'components/publicEnrollment/steps/SelectExam';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';

export const PublicEnrollmentStepContents = ({
  activeStep,
  enrollment,
  isLoading,
  setIsStepValid,
  showValidation,
  isExpectedToHaveOpenings,
  selectedExamEvent,
}: {
  activeStep: PublicEnrollmentFormStep;
  enrollment: PublicEnrollment;
  isLoading: boolean;
  setIsStepValid: (isValid: boolean) => void;
  showValidation: boolean;
  isExpectedToHaveOpenings: boolean;
  selectedExamEvent: PublicExamEvent;
}) => {
  switch (activeStep) {
    case PublicEnrollmentFormStep.Authenticate:
      return (
        <Authenticate
          isLoading={isLoading}
          isExpectedToHaveOpenings={isExpectedToHaveOpenings}
          selectedExamEvent={selectedExamEvent}
        />
      );
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
    case PublicEnrollmentFormStep.PaymentFail:
    case PublicEnrollmentFormStep.PaymentSuccess:
    case PublicEnrollmentFormStep.Done:
      return <Done step={activeStep} enrollment={enrollment} />;
    default:
      return <> </>;
  }
};
