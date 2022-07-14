import { Step, StepLabel, Stepper } from '@mui/material';
import { CircularStepper } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';

import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { ContactRequestFormStep } from 'enums/contactRequest';
import { contactRequestSelector } from 'redux/selectors/contactRequest';

export const ContactRequestStepper = () => {
  const { activeStep } = useAppSelector(contactRequestSelector);
  const { isPhone } = useWindowProperties();
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.contactRequestForm.steps',
  });
  const translateCommon = useCommonTranslation();
  const phasePrefix = translateCommon('phase');
  const stepNumbers = Object.values(ContactRequestFormStep)
    .filter((v) => !isNaN(Number(v)))
    .map(Number);
  const maxStep = Math.max(...stepNumbers);
  const value = activeStep * (100 / maxStep);
  const stepAriaLabel = (step: number) => {
    const phaseDescription = t(ContactRequestFormStep[step]);
    const phaseNumberPart = `${step}/${maxStep}`;
    if (step < activeStep) {
      return `${phasePrefix} ${phaseNumberPart}, ${t(
        'completed'
      )}: ${phaseDescription}`;
    } else if (step == activeStep) {
      return `${phasePrefix} ${phaseNumberPart}, ${t(
        'active'
      )}: ${phaseDescription}`;
    } else {
      return `${phasePrefix} ${phaseNumberPart}: ${phaseDescription}`;
    }
  };
  const text = `${activeStep}/${maxStep}`;

  const ariaLabel = `${translateCommon('phase')} ${text}: ${t(
    ContactRequestFormStep[activeStep]
  )}`;

  return isPhone ? (
    <CircularStepper
      value={value}
      ariaLabel={ariaLabel}
      phaseText={text}
      size={90}
    />
  ) : (
    <Stepper className="contact-request-page__stepper" activeStep={activeStep}>
      {stepNumbers.map((v) => (
        <Step key={v}>
          <StepLabel
            aria-label={stepAriaLabel(v)}
            className={
              activeStep < v
                ? 'contact-request-page__stepper__step--disabled'
                : undefined
            }
          >
            {t(ContactRequestFormStep[v])}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
