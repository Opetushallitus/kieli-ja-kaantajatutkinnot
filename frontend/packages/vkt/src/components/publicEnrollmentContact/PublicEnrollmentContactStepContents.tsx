import { ConfirmContactDetails } from 'components/publicEnrollmentContact/steps/ConfirmContactDetails';
import { Done } from 'components/publicEnrollmentContact/steps/Done';
import { FillContactDetails } from 'components/publicEnrollmentContact/steps/FillContactDetails';
import { SelectExam } from 'components/publicEnrollmentContact/steps/SelectExam';
import { useAppSelector } from 'configs/redux';
import { PublicEnrollmentContactFormStep } from 'enums/publicEnrollment';
import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';
import { updatePublicEnrollmentContact } from 'redux/reducers/publicEnrollmentContact';
import { publicEnrollmentContactSelector } from 'redux/selectors/publicEnrollmentContact';

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
  const { contactDetailsNeedConfirmation } = useAppSelector(
    publicEnrollmentContactSelector,
  );

  switch (activeStep) {
    case PublicEnrollmentContactFormStep.FillContactDetails:
      if (contactDetailsNeedConfirmation) {
        return <ConfirmContactDetails enrollment={enrollment} />;
      } else {
        return (
          <FillContactDetails
            enrollment={enrollment}
            isLoading={false}
            setIsStepValid={setIsStepValid}
            showValidation={showValidation}
            updatePublicEnrollment={updatePublicEnrollmentContact}
          />
        );
      }

    case PublicEnrollmentContactFormStep.SelectExam:
      return (
        <SelectExam
          enrollment={enrollment}
          isLoading={false}
          setIsStepValid={setIsStepValid}
          showValidation={showValidation}
          updatePublicEnrollment={updatePublicEnrollmentContact}
        />
      );
    case PublicEnrollmentContactFormStep.Done:
      return <Done />;
  }
};
