import { Step, StepLabel, Stepper } from '@mui/material';

import { H1, H2, H3, Text } from 'components/elements/Text';
import { VerifySelectedTranslators } from 'components/contactRequest/steps/VerifySelectedTranslators';
import { FillContactDetails } from 'components/contactRequest/steps/FillContactDetails';
import { WriteMessage } from 'components/contactRequest/steps/WriteMessage';
import { PreviewAndSend } from 'components/contactRequest/steps/PreviewAndSend';
import { Done } from 'components/contactRequest/steps/Done';
import {
  useAppTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { contactRequestSelector } from 'redux/selectors/contactRequest';
import {
  publicTranslatorsSelector,
  selectedPublicTranslatorsForLanguagePair,
} from 'redux/selectors/publicTranslator';
import { ContactRequestFormStep } from 'enums/contactRequest';

export const stepsByIndex = {
  0: 'verifySelectedTranslators',
  1: 'fillContactDetails',
  2: 'writeMessage',
  3: 'previewAndSend',
  4: 'done',
};

export const ChosenTranslatorsHeading = () => {
  const { filters } = useAppSelector(publicTranslatorsSelector);
  const { fromLang, toLang } = filters;
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.contactRequestForm',
  });
  const translateLanguage = useKoodistoLanguagesTranslation();

  return (
    <div className="columns">
      <H3>{`${t('chosenTranslatorsForLanguagePair')}`}</H3>
      <H3 className="contact-request-page__lang-pair">
        {`${translateLanguage(fromLang)} - ${translateLanguage(toLang)}`}
      </H3>
    </div>
  );
};

export const RenderChosenTranslators = () => {
  const translators = useAppSelector(selectedPublicTranslatorsForLanguagePair);
  const translatorsString = translators
    .map(({ firstName, lastName }) => firstName + ' ' + lastName)
    .join(', ');

  return (
    <Text data-testid="contact-request-page__chosen-translators-text">
      {translatorsString}
    </Text>
  );
};

export const DisplayContactInfo = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.contactRequestForm.formLabels',
  });
  const { request } = useAppSelector(contactRequestSelector);

  return (
    <div className="rows gapped">
      <H2>{t('contactInfo')}</H2>
      <div className="rows">
        <H3>{t('firstName')}</H3>
        <Text data-testid="contact-info__first-name-text">
          {request?.firstName}
        </Text>
      </div>
      <div className="rows">
        <H3>{t('lastName')}</H3>
        <Text data-testid="contact-info__last-name-text">
          {request?.lastName}
        </Text>
      </div>
      <div className="rows">
        <H3>{t('email')}</H3>
        <Text data-testid="contact-info__email-text">{request?.email}</Text>
      </div>
      {request?.phoneNumber && (
        <div className="rows">
          <H3>{t('phoneNumber')}</H3>
          <Text data-testid="contact-info__phone-number-text">
            {request.phoneNumber}
          </Text>
        </div>
      )}
    </div>
  );
};

export const StepHeading = ({ step }: { step: string }) => {
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.contactRequestForm.steps',
  });

  return (
    <div
      className="contact-request-page__heading"
      data-testid={`contact-request-page__step-heading-${step}`}
    >
      <H1>{t(step)}</H1>
    </div>
  );
};

export const ContactRequestStepper = () => {
  const { activeStep } = useAppSelector(contactRequestSelector);
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.contactRequestForm.steps',
  });

  return (
    <Stepper className="contact-request-page__stepper" activeStep={activeStep}>
      {Object.values(stepsByIndex).map((v) => (
        <Step key={v}>
          <StepLabel>{t(v)}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export const StepContents = ({
  disableNext,
}: {
  disableNext: (disabled: boolean) => void;
}) => {
  const { activeStep } = useAppSelector(contactRequestSelector);

  switch (activeStep) {
    case ContactRequestFormStep.VerifyTranslators:
      return <VerifySelectedTranslators disableNext={disableNext} />;
    case ContactRequestFormStep.FillContactDetails:
      return <FillContactDetails disableNext={disableNext} />;
    case ContactRequestFormStep.WriteMessage:
      return <WriteMessage disableNext={disableNext} />;
    case ContactRequestFormStep.PreviewAndSend:
      return <PreviewAndSend />;
    case ContactRequestFormStep.Done:
      return <Done />;
    default:
      return <> </>;
  }
};
