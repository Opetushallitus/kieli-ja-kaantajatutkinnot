import { Authenticate } from 'components/publicEnrollment/steps/Authenticate';
import { Done } from 'components/publicEnrollment/steps/Done';
import { Fail } from 'components/publicEnrollment/steps/Fail';
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
  selectedExamEvent,
}: {
  activeStep: PublicEnrollmentFormStep;
  enrollment: PublicEnrollment;
  isLoading: boolean;
  setIsStepValid: (isValid: boolean) => void;
  showValidation: boolean;
  selectedExamEvent: PublicExamEvent;
}) => {
  switch (activeStep) {
    case PublicEnrollmentFormStep.Authenticate:
      return <Authenticate selectedExamEvent={selectedExamEvent} />;
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
      return <Fail enrollment={enrollment} />;
    case PublicEnrollmentFormStep.PaymentSuccess:
      return <Done enrollment={enrollment} isEnrollmentToQueue={false} />;
    case PublicEnrollmentFormStep.Done:
      return <Done enrollment={enrollment} isEnrollmentToQueue={true} />;
    default:
      return <> </>;
  }
};
