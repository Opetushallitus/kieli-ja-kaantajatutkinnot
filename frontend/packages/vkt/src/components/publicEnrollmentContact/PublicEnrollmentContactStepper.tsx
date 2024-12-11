import { Step, StepLabel, Stepper, Typography } from '@mui/material';
import { CircularStepper, Text } from 'shared/components';
import { Color } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { PublicEnrollmentContactFormStep } from 'enums/publicEnrollment';
import { PublicEnrollmentUtils } from 'utils/publicEnrollment';

export const PublicEnrollmentContactStepper = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentContactFormStep;
}) => {
  const { isPhone } = useWindowProperties();

  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentContact',
  });
  const translateCommon = useCommonTranslation();

  const steps = PublicEnrollmentUtils.getEnrollmentContactSteps();

  const doneStepNumber = steps.length;

  const getDescription = (step: PublicEnrollmentContactFormStep) => {
    return t(`stepper.step.${PublicEnrollmentContactFormStep[step]}`);
  };

  const getStepAriaLabel = (stepNumber: number, stepIndex: number) => {
    const part = t('stepper.phaseNumber', {
      current: stepIndex + 1,
      total: steps.length,
    });
    const statusText = isStepCompleted(stepNumber)
      ? t('stepper.completed')
      : '';
    const partStatus = statusText ? `${part}, ${statusText}` : part;

    return `${t('stepper.phase')} ${partStatus}: ${getDescription(stepNumber)}`;
  };

  const getDesktopActiveStep = () => {
    return activeStep - 1;
  };

  const isStepCompleted = (step: PublicEnrollmentContactFormStep) => {
    return step < activeStep;
  };

  const stepValue = Math.min(activeStep, doneStepNumber);

  const mobileStepValue = stepValue * (100 / doneStepNumber);
  const mobilePhaseText = `${stepValue}/${doneStepNumber}`;
  const mobileAriaLabel = `${t('stepper.phase')} ${mobilePhaseText}: ${t(
    `stepper.step.${PublicEnrollmentContactFormStep[activeStep]}`,
  )}`;

  const getMobileStepperHeading = () => {
    const heading = (
      <Typography component="p" variant="h2">
        {t(`stepHeading.${PublicEnrollmentContactFormStep[activeStep]}`)}
      </Typography>
    );

    if (activeStep === PublicEnrollmentContactFormStep.Done) {
      return <>{heading}</>;
    }

    const nextStepIndex = Math.min(
      PublicEnrollmentContactFormStep.Done,
      activeStep + 1,
    );

    return (
      <>
        {heading}
        <div>
          <Text>
            {translateCommon('next')}
            {': '}
            {t(
              `stepper.step.${PublicEnrollmentContactFormStep[nextStepIndex]}`,
            )}
          </Text>
        </div>
      </>
    );
  };

  return isPhone ? (
    <div className="columns gapped-xxl">
      <div role="group" aria-label={t('phases')}>
        <CircularStepper
          value={mobileStepValue}
          ariaLabel={mobileAriaLabel}
          phaseText={mobilePhaseText}
          color={Color.Secondary}
          size={90}
        />
      </div>
      <div className="rows gapped-xs grow">{getMobileStepperHeading()}</div>
    </div>
  ) : (
    <Stepper
      className="public-enrollment__grid__stepper"
      activeStep={getDesktopActiveStep()}
      aria-label={t('stepper.phases')}
    >
      {steps.map((step, index) => (
        <Step
          data-testid={`enrollment-step-${index}`}
          key={step}
          completed={isStepCompleted(step)}
        >
          {/* eslint-disable jsx-a11y/aria-role */}
          <StepLabel
            aria-label={getStepAriaLabel(step, index)}
            role="text"
            className={
              activeStep < step
                ? 'public-enrollment__grid__stepper__step-disabled'
                : undefined
            }
          >
            {/* eslint-enable */}
            {getDescription(step)}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
