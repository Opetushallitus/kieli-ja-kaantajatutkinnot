import { Step, StepLabel, Stepper } from '@mui/material';

import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { registrationSelector } from 'redux/selectors/registration';

export const PublicRegistrationStepper = () => {
  const { activeStep } = useAppSelector(registrationSelector);
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.stepper',
  });

  const doneStepNumber = PublicRegistrationFormStep.Payment;

  const stepNumbers = Object.values(PublicRegistrationFormStep)
    .filter((i) => !isNaN(Number(i)))
    .map(Number)
    .filter((i) => i <= doneStepNumber);

  const getStatusText = (stepNumber: number) => {
    if (stepNumber < activeStep) {
      return t('completed');
    } else if (stepNumber === activeStep) {
      return t('active');
    }
  };

  const getDescription = (stepNumber: number) => {
    return t(`step.${PublicRegistrationFormStep[stepNumber]}`);
  };

  const getStepAriaLabel = (stepNumber: number) => {
    const part = `${stepNumber}/${stepNumbers.length}`;
    const statusText = getStatusText(stepNumber);
    const partStatus = statusText ? `${part}, ${statusText}` : part;

    return `${t('phase')} ${partStatus}: ${getDescription(stepNumber)}`;
  };

  return (
    <Stepper
      className="public-registration__grid__stepper"
      activeStep={activeStep - 1}
    >
      {stepNumbers.map((i) => (
        <Step key={i}>
          <StepLabel
            aria-label={getStepAriaLabel(i)}
            className={
              activeStep < i
                ? 'public-registration__grid__stepper__step-disabled'
                : undefined
            }
          >
            {getDescription(i)}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
