import { Step, StepLabel, Stepper, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useSearchParams } from 'react-router-dom';
import { CircularStepper, Text } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PaymentStatus } from 'enums/api';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { registrationSelector } from 'redux/selectors/registration';

export const PublicRegistrationStepper = () => {
  const { activeStep } = useAppSelector(registrationSelector);
  const { status: initRegistrationStatus, error: initRegistrationError } =
    useAppSelector(registrationSelector).initRegistration;
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.stepper',
  });
  const translateCommon = useCommonTranslation();
  const { isPhone } = useWindowProperties();

  const [params] = useSearchParams();
  const paymentStatus = params.get('status');

  const isError =
    (activeStep === PublicRegistrationFormStep.Done &&
      paymentStatus !== PaymentStatus.Success) ||
    (activeStep === PublicRegistrationFormStep.Register &&
      initRegistrationStatus === APIResponseStatus.Error) ||
    (activeStep === PublicRegistrationFormStep.Identify &&
      initRegistrationError);

  const doneStepNumber = PublicRegistrationFormStep.Done;

  const stepNumbers = Object.values(PublicRegistrationFormStep)
    .filter((i) => !isNaN(Number(i)))
    .map(Number)
    .filter((i) => i <= doneStepNumber);

  const getDescription = (stepNumber: number) => {
    return t(`step.${PublicRegistrationFormStep[stepNumber]}`);
  };

  const getNextInformation = (stepNumber: number) => {
    if (stepNumber < doneStepNumber) {
      return `${translateCommon('next')}: ${getDescription(activeStep + 1)}`;
    } else if (isError) {
      return '';
    } else {
      return t('welcomeToExam');
    }
  };

  const isStepCompleted = (step: number) => {
    return step < activeStep;
  };

  const getPhaseDescription = (stepNumber: number) => {
    const part = t('phaseNumber', {
      current: stepNumber,
      total: stepNumbers.length,
    });
    const statusText = isStepCompleted(stepNumber) ? t('completed') : '';
    const partStatus = statusText ? `${part}, ${statusText}` : part;

    return `${t('phase')} ${partStatus}: ${getDescription(stepNumber)}`;
  };

  const stepValue =
    isError && activeStep === PublicRegistrationFormStep.Done
      ? PublicRegistrationFormStep.Payment
      : Math.min(activeStep, doneStepNumber);

  const mobileStepValue = stepValue * (100 / doneStepNumber);
  const phaseText = `${stepValue}/${doneStepNumber}`;
  const mobileAriaLabel = `${getPhaseDescription(stepValue)}`;

  if (isPhone) {
    return (
      <div
        className="columns gapped-xxl public-registration__grid__circular-stepper-container"
        aria-label={t('label')}
        role="group"
      >
        <CircularStepper
          value={mobileStepValue}
          aria-hidden={true}
          ariaLabel={mobileAriaLabel}
          phaseText={phaseText}
          color={isError ? Color.Error : Color.Secondary}
          size={90}
        />
        <Text sx={visuallyHidden}>{mobileAriaLabel}</Text>
        <div className="rows">
          <Typography component="p" variant="h2">
            {getDescription(stepValue)}
          </Typography>
          {!isError && <Text>{getNextInformation(stepValue)}</Text>}
        </div>
      </div>
    );
  } else {
    return (
      <Stepper
        className="public-registration__grid__stepper"
        aria-label={t('label')}
        activeStep={stepValue - 1}
        role="group"
      >
        {stepNumbers.map((i) => (
          <Step key={i}>
            <StepLabel
              error={isError && stepValue === i}
              aria-current={stepValue === i && 'step'}
              className={
                stepValue === i && isError
                  ? 'public-registration__grid__stepper__step-error'
                  : stepValue < i
                  ? 'public-registration__grid__stepper__step-disabled'
                  : undefined
              }
            >
              <Text sx={visuallyHidden}>{getPhaseDescription(i)}</Text>
              <span aria-hidden={true}>{getDescription(i)}</span>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    );
  }
};
