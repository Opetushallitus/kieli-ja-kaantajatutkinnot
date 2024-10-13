import { Done } from 'components/publicEnrollmentContact/steps/Done';
import { FillContactDetails } from 'components/publicEnrollmentContact/steps/FillContactDetails';
import { SelectExam } from 'components/publicEnrollmentContact/steps/SelectExam';
import { PublicEnrollmentContactFormStep } from 'enums/publicEnrollment';
import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';

export const PublicEnrollmentContactStepContents = ({
  activeStep,
  enrollment,
  setIsStepValid,
  showValidation,
}: {
  activeStep: PublicEnrollmentContactFormStep;
  enrollment: PublicEnrollmentContact;
  setIsStepValid: (isValid: boolean) => void;
  showValidation: boolean;
}) => {
  switch (activeStep) {
    case PublicEnrollmentContactFormStep.FillContactDetails:
      return (
        <FillContactDetails
          enrollment={enrollment}
          isLoading={false}
          setIsStepValid={setIsStepValid}
        />
      );
    case PublicEnrollmentContactFormStep.SelectExam:
      return (
        <SelectExam
          enrollment={enrollment}
          isLoading={false}
          setIsStepValid={setIsStepValid}
          showValidation={showValidation}
        />
      );
    case PublicEnrollmentContactFormStep.Done:
      return <Done enrollment={enrollment} />;
  }
};
