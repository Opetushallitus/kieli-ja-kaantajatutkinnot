import { Payment } from 'components/registration/steps/Payment';
import { SubmitRegistrationDetails } from 'components/registration/steps/register/SubmitRegistrationDetails';
import { useAppSelector } from 'configs/redux';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { registrationSelector } from 'redux/selectors/registration';

export const PublicRegistrationStepContents = () => {
  const { activeStep } = useAppSelector(registrationSelector);
  switch (activeStep) {
    case PublicRegistrationFormStep.Identify:
      return <></>;
    case PublicRegistrationFormStep.Register:
      return <SubmitRegistrationDetails />;
    case PublicRegistrationFormStep.Payment:
      return <Payment />;
    default:
      return <> </>;
  }
};
