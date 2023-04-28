import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { H2, H3, Text } from 'shared/components';
import { useFocus, useWindowProperties } from 'shared/hooks';

import { Done } from 'components/contactRequest/steps/Done';
import { FillContactDetails } from 'components/contactRequest/steps/FillContactDetails';
import { PreviewAndSend } from 'components/contactRequest/steps/PreviewAndSend';
import { VerifySelectedTranslators } from 'components/contactRequest/steps/VerifySelectedTranslators';
import { WriteMessage } from 'components/contactRequest/steps/WriteMessage';
import {
  useAppTranslation,
  useCommonTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { ContactRequestFormStep } from 'enums/contactRequest';
import { ContactDetails } from 'interfaces/contactRequest';
import { contactRequestSelector } from 'redux/selectors/contactRequest';
import {
  publicTranslatorsSelector,
  selectedPublicTranslatorsForLanguagePair,
} from 'redux/selectors/publicTranslator';
import { AuthorisationUtils } from 'utils/authorisation';

export const ChosenTranslatorsHeading = () => {
  const { filters } = useAppSelector(publicTranslatorsSelector);
  const { fromLang, toLang } = filters;
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.contactRequestForm',
  });
  const translateLanguage = useKoodistoLanguagesTranslation();

  return (
    <div className="rows gapped">
      <H2>{t('recipients')}</H2>
      <H3>
        {`${t('chosenTranslatorsForLanguagePair')}`}{' '}
        <span className="contact-request-page__lang-pair">
          {AuthorisationUtils.getLanguagePairLocalisation(
            { from: fromLang, to: toLang },
            translateLanguage
          )}
        </span>
      </H3>
    </div>
  );
};

export const ChosenTranslators = () => {
  const translators = useAppSelector(selectedPublicTranslatorsForLanguagePair);
  const translatorNames = translators.map(
    ({ firstName, lastName }) => firstName + ' ' + lastName
  );

  return (
    <ul>
      {translatorNames.map((name, i) => (
        <Text key={i}>
          <li>{name}</li>
        </Text>
      ))}
    </ul>
  );
};

export const DisplayContactInfo = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.contactRequestForm.formLabels',
  });
  const { request } = useAppSelector(contactRequestSelector);

  if (!request) {
    return null;
  }

  const printContactDetail = (detail: keyof ContactDetails) => (
    <div className="rows">
      <Text className="bold">
        {t(detail)}
        {':'}
      </Text>
      <Text data-testid={`contact-request-page__contact-detail__${detail}`}>
        {request[detail]}
      </Text>
    </div>
  );

  return (
    <div className="rows gapped">
      <H2>{t('contactInfo')}</H2>
      <div className="grid-2-columns gapped">
        {printContactDetail('firstName')}
        {printContactDetail('lastName')}
      </div>
      <div className="grid-2-columns gapped">
        {printContactDetail('email')}
        {request.phoneNumber && printContactDetail('phoneNumber')}
      </div>
    </div>
  );
};

// StepHeading is not shown on mobile devices
export const StepHeading = ({ step }: { step: ContactRequestFormStep }) => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.contactRequestForm.steps',
  });
  const translateCommon = useCommonTranslation();

  const [ref, setFocus] = useFocus<HTMLSpanElement>();
  const { isPhone } = useWindowProperties();
  const numberOfSteps = Object.values(ContactRequestFormStep).filter(
    (v) => !isNaN(Number(v))
  ).length;
  const headingAriaLabel = `${translateCommon(
    'phase'
  )} ${step}/${numberOfSteps}: ${t(ContactRequestFormStep[step])}`;

  useEffect(() => {
    if (!isPhone) {
      setFocus();
    }
  }, [setFocus, isPhone]);

  return !isPhone ? (
    <div
      className="contact-request-page__heading"
      data-testid={`contact-request-page__step-heading-${ContactRequestFormStep[step]}`}
    >
      <Typography
        variant="h1"
        aria-label={headingAriaLabel}
        ref={ref}
        tabIndex={0}
      >
        {t(ContactRequestFormStep[step])}
      </Typography>
    </div>
  ) : (
    <></>
  );
};

export const StepContents = ({
  disableNext,
  onDataChanged,
}: {
  disableNext: (disabled: boolean) => void;
  onDataChanged: () => void;
}) => {
  const { activeStep } = useAppSelector(contactRequestSelector);

  switch (activeStep) {
    case ContactRequestFormStep.VerifyTranslators:
      return <VerifySelectedTranslators disableNext={disableNext} />;
    case ContactRequestFormStep.FillContactDetails:
      return (
        <FillContactDetails
          disableNext={disableNext}
          onDataChanged={onDataChanged}
        />
      );
    case ContactRequestFormStep.WriteMessage:
      return <WriteMessage disableNext={disableNext} />;
    case ContactRequestFormStep.PreviewAndSend:
      return <PreviewAndSend disableNext={disableNext} />;
    case ContactRequestFormStep.Done:
      return <Done />;
    default:
      return <> </>;
  }
};
