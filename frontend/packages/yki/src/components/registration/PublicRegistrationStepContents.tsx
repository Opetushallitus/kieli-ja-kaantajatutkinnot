import { Done } from 'components/registration/steps/Done';
import { EmailRegistrationFillContactDetails } from 'components/registration/steps/EmailRegistrationFillContactDetails';
import { FillContactDetails } from 'components/registration/steps/FillContactDetails';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import {
  PublicEmailRegistration,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';

export const PublicRegistrationStepContents = ({
  activeStep,
  registration,
  isLoading,
  isEmailRegistration,
  disableNext,
}: {
  activeStep: PublicRegistrationFormStep;
  registration: PublicEmailRegistration | PublicSuomiFiRegistration;
  isLoading: boolean;
  isEmailRegistration?: boolean;
  disableNext: (disabled: boolean) => void;
}) => {
  switch (activeStep) {
    case PublicRegistrationFormStep.Identify:
      return <></>;
    case PublicRegistrationFormStep.Register:
      if (isEmailRegistration) {
        return (
          <EmailRegistrationFillContactDetails
            registration={registration as PublicEmailRegistration}
            isLoading={isLoading}
            disableNext={disableNext}
          />
        );
      }

      return (
        <FillContactDetails
          registration={registration as PublicSuomiFiRegistration}
          isLoading={isLoading}
          disableNext={disableNext}
        />
      );
    case PublicRegistrationFormStep.Done:
      return <Done registration={registration} />;
    default:
      return <> </>;
  }
};
