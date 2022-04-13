import { Typography } from '@mui/material';
import { useEffect } from 'react';

import { Done } from 'components/contactRequest/steps/Done';
import { FillContactDetails } from 'components/contactRequest/steps/FillContactDetails';
import { PreviewAndSend } from 'components/contactRequest/steps/PreviewAndSend';
import { VerifySelectedTranslators } from 'components/contactRequest/steps/VerifySelectedTranslators';
import { WriteMessage } from 'components/contactRequest/steps/WriteMessage';
import { CustomTextField } from 'components/elements/CustomTextField';
import { H3, Text } from 'components/elements/Text';
import {
  useAppTranslation,
  useCommonTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { ContactRequestFormStep } from 'enums/contactRequest';
import { useFocus } from 'hooks/useFocus';
import { useWindowProperties } from 'hooks/useWindowProperties';
import { contactRequestSelector } from 'redux/selectors/contactRequest';
import {
  publicTranslatorsSelector,
  selectedPublicTranslatorsForLanguagePair,
} from 'redux/selectors/publicTranslator';

export const ChosenTranslatorsHeading = () => {
  const { filters } = useAppSelector(publicTranslatorsSelector);
  const { activeStep } = useAppSelector(contactRequestSelector);
  const { fromLang, toLang } = filters;
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.contactRequestForm',
  });
  const translateLanguage = useKoodistoLanguagesTranslation();
  const { isPhone } = useWindowProperties();
  const showOnPhone =
    activeStep === ContactRequestFormStep.VerifyTranslators ||
    activeStep === ContactRequestFormStep.PreviewAndSend;
  const divClassName = isPhone ? 'rows' : 'columns';

  const renderChosenTranslatorsHeading = () => (
    <div className={divClassName}>
      <H3>{`${t('chosenTranslatorsForLanguagePair')}`}</H3>
      <H3 className="contact-request-page__lang-pair">
        {`${translateLanguage(fromLang)} - ${translateLanguage(toLang)}`}
      </H3>
    </div>
  );

  const renderPhoneView = () =>
    showOnPhone ? renderChosenTranslatorsHeading() : <></>;

  return isPhone ? renderPhoneView() : renderChosenTranslatorsHeading();
};

export const ChosenTranslators = () => {
  const { isPhone } = useWindowProperties();
  const { activeStep } = useAppSelector(contactRequestSelector);
  const translators = useAppSelector(selectedPublicTranslatorsForLanguagePair);
  const translatorsString = translators
    .map(({ firstName, lastName }) => firstName + ' ' + lastName)
    .join(', ');

  const renderChosenTranslators = () => (
    <Text data-testid="contact-request-page__chosen-translators-text">
      {translatorsString}
    </Text>
  );

  const showOnPhone = activeStep === ContactRequestFormStep.PreviewAndSend;

  const renderPhoneView = () =>
    showOnPhone ? renderChosenTranslators() : <></>;

  return isPhone ? renderPhoneView() : renderChosenTranslators();
};

export const DisplayContactInfo = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.contactRequestForm.formLabels',
  });
  const { request } = useAppSelector(contactRequestSelector);

  return (
    <div className="rows gapped">
      <H3>{t('contactInfo')}</H3>
      <div className="grid-columns gapped">
        <CustomTextField
          disabled
          value={request?.firstName}
          label={t('firstName')}
        />
        <CustomTextField
          disabled
          value={request?.lastName}
          label={t('lastName')}
        />
      </div>
      <div className="grid-columns gapped">
        <CustomTextField disabled value={request?.email} label={t('email')} />
        {request?.phoneNumber && (
          <CustomTextField
            disabled
            value={request?.phoneNumber}
            label={t('phoneNumber')}
          />
        )}
      </div>
    </div>
  );
};

// StepHeading is not shown on mobile devices
export const StepHeading = ({ step }: { step: ContactRequestFormStep }) => {
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.contactRequestForm.steps',
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
      return <PreviewAndSend />;
    case ContactRequestFormStep.Done:
      return <Done />;
    default:
      return <> </>;
  }
};
