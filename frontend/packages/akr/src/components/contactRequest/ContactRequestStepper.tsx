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
    keyPrefix: 'akr.component.contactRequestForm.steps',
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
    const phaseNumberPart = t('phaseNumber', {
      current: step,
      total: maxStep,
    });
    if (step < activeStep) {
      return `${phasePrefix} ${phaseNumberPart}, ${t(
        'completed',
      )}: ${phaseDescription}`;
    } else {
      return `${phasePrefix} ${phaseNumberPart}: ${phaseDescription}`;
    }
  };

  const text = `${activeStep}/${maxStep}`;
  const ariaText = t('phaseNumber', {
    current: activeStep,
    total: maxStep,
  });

  const ariaLabel = `${translateCommon('phase')} ${ariaText}`;

  return isPhone ? (
    <div aria-label={t('ariaLabel')} role="group">
      <CircularStepper
        value={value}
        ariaLabel={ariaLabel}
        phaseText={text}
        size={90}
      />
    </div>
  ) : (
    <Stepper
      aria-label={t('ariaLabel')}
      role="group"
      className="contact-request-page__stepper"
      activeStep={activeStep - 1}
    >
      {stepNumbers.map((v) => (
        <Step key={v}>
          <StepLabel
            aria-current={activeStep === v && 'step'}
            aria-label={stepAriaLabel(v)}
            className={
              activeStep < v
                ? 'contact-request-page__stepper__step--disabled'
                : undefined
            }
          >
            <span aria-hidden={true}>{t(ContactRequestFormStep[v])}</span>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
