import { useAppSelector } from 'configs/redux';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { Payment } from 'features/registration/components/steps/Payment';
import { SubmitRegistrationDetails } from 'features/registration/components/steps/register/SubmitRegistrationDetails';
import { registrationSelector } from 'features/registration/redux/selectors/registration';

export const PublicRegistrationStepContents = () => {
  const { activeStep } = useAppSelector(registrationSelector);
  switch (activeStep) {
    case PublicRegistrationFormStep.Identify:
      return <></>;
    case PublicRegistrationFormStep.Register:
      return <SubmitRegistrationDetails />;
    case PublicRegistrationFormStep.Done:
      return <Payment />;
    default:
      return <> </>;
  }
};
