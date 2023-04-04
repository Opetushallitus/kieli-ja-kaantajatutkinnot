import { Done } from 'components/registration/steps/Done';
import { EmailRegistration } from 'components/registration/steps/EmailRegistration';
import { SuomiFiRegistration } from 'components/registration/steps/SuomiFiRegistration';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import {
  PublicEmailRegistration,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';

export const PublicRegistrationStepContents = ({
  activeStep,
  registration,
  isEmailRegistration,
}: {
  activeStep: PublicRegistrationFormStep;
  registration: Partial<PublicEmailRegistration | PublicSuomiFiRegistration>;
  isEmailRegistration?: boolean;
}) => {
  switch (activeStep) {
    case PublicRegistrationFormStep.Identify:
      return <></>;
    case PublicRegistrationFormStep.Register:
      if (isEmailRegistration) {
        return (
          <EmailRegistration
            registration={registration as PublicEmailRegistration}
          />
        );
      }

      return (
        <SuomiFiRegistration
          registration={registration as PublicSuomiFiRegistration}
        />
      );
    case PublicRegistrationFormStep.Done:
      return <Done registration={registration} />;
    default:
      return <> </>;
  }
};
