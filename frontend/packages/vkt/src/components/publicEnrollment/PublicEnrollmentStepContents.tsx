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
  disableNext,
}: {
  activeStep: PublicEnrollmentFormStep;
  enrollment: PublicEnrollment;
  isLoading: boolean;
  disableNext: (disabled: boolean) => void;
}) => {
  switch (activeStep) {
    case PublicEnrollmentFormStep.Identify:
      return <></>;
    case PublicEnrollmentFormStep.FillContactDetails:
      return (
        <FillContactDetails
          enrollment={enrollment}
          isLoading={isLoading}
          disableNext={disableNext}
        />
      );
    case PublicEnrollmentFormStep.SelectExam:
      return (
        <SelectExam
          enrollment={enrollment}
          isLoading={isLoading}
          disableNext={disableNext}
        />
      );
    case PublicEnrollmentFormStep.Preview:
      return (
        <Preview
          enrollment={enrollment}
          isLoading={isLoading}
          disableNext={disableNext}
        />
      );
    case PublicEnrollmentFormStep.Payment:
      return <></>;
    case PublicEnrollmentFormStep.Done:
      return <Done enrollment={enrollment} />;
    default:
      return <> </>;
  }
};
