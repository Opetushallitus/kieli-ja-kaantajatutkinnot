import { Step, StepLabel, Stepper, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useSearchParams } from 'react-router';
import { CircularStepper, Text } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PaymentStatus } from 'enums/api';
import { RegistrationKind } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { publicFreeRegistrationSelector } from 'redux/selectors/publicFreeRegistration';
import { registrationSelector } from 'redux/selectors/registration';

export const PublicRegistrationStepper = () => {
  const { activeStep } = useAppSelector(registrationSelector);
  const { examSession } = useAppSelector(examSessionSelector);
  const { status: initRegistrationStatus, error: initRegistrationError } =
    useAppSelector(registrationSelector).initRegistration;
  const { isFree } = useAppSelector(publicFreeRegistrationSelector);
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.stepper',
  });
  const translateCommon = useCommonTranslation();
  const { isDesktopXS } = useWindowProperties();

  const [params] = useSearchParams();
  const paymentStatus = params.get('status');
  const queue = params.get('queue');

  const isError =
    (activeStep === PublicRegistrationFormStep.Done &&
      paymentStatus !== PaymentStatus.Success &&
      isFree !== 'YES') ||
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
    if (
      (examSession?.available_registration_kind === RegistrationKind.Queue ||
        queue === 'true') &&
      stepNumber === PublicRegistrationFormStep.Register
    ) {
      return t('step.Register');
    } else {
      return t(`step.${PublicRegistrationFormStep[stepNumber]}`);
    }
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

  if (!isDesktopXS) {
    return (
      <div
        className="columns gapped-xxl public-registration__grid__circular-stepper-container"
        aria-label={t('label')}
        role="group"
      >
        <CircularStepper
          value={mobileStepValue}
          ariaLabel={mobileAriaLabel}
          phaseText={phaseText}
          color={isError ? Color.Error : Color.Secondary}
          size={90}
        />
        <div className="rows">
          <Typography component="p" variant="h2" aria-hidden={true}>
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
