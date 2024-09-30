import { Grid, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { H1, HeaderSeparator, Text } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';

import { StepContents } from 'components/contactRequest/ContactRequestFormUtils';
import { ContactRequestStepper } from 'components/contactRequest/ContactRequestStepper';
import { ControlButtons } from 'components/contactRequest/ControlButtons';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ContactRequestFormStep } from 'enums/contactRequest';
import { updateContactRequest } from 'redux/reducers/contactRequest';
import { contactRequestSelector } from 'redux/selectors/contactRequest';
import { publicTranslatorsSelector } from 'redux/selectors/publicTranslator';

export const ContactRequestPage = () => {
  // I18
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.contactRequestForm',
  });
  const translateCommon = useCommonTranslation();

  // Window properties
  const { isPhone } = useWindowProperties();
  // State
  const [disableNext, setDisableNext] = useState(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  // Redux
  const dispatch = useAppDispatch();
  const { activeStep } = useAppSelector(contactRequestSelector);
  const nextStep = (activeStep + 1) as ContactRequestFormStep;
  const { filters, selectedTranslators } = useAppSelector(
    publicTranslatorsSelector,
  );
  const { fromLang: from, toLang: to } = filters;

  useEffect(() => {
    dispatch(
      updateContactRequest({
        languagePair: { from, to },
        translatorIds: selectedTranslators,
      }),
    );
  }, [dispatch, from, to, selectedTranslators]);

  const disableNextCb = (disabled: boolean) => setDisableNext(disabled);
  const showControlButtons =
    activeStep <= ContactRequestFormStep.PreviewAndSend;

  const renderHeaderGrid = () => (
    <div className="contact-request-page__grid__heading-container">
      <H1>{t('title')}</H1>
      <HeaderSeparator />
      <Text>{t('description')}</Text>
    </div>
  );

  const renderPhoneView = () => (
    <>
      <div className="contact-request-page__grid__stepper-container columns gapped">
        <ContactRequestStepper />
        <div className="rows">
          <Typography component="p" variant="h2">
            {t(`steps.${ContactRequestFormStep[activeStep]}`)}
          </Typography>
          {ContactRequestFormStep[nextStep] && (
            <Text>
              {translateCommon('next')}:{' '}
              {t(`steps.${ContactRequestFormStep[nextStep]}`)}
            </Text>
          )}
        </div>
      </div>

      {activeStep === ContactRequestFormStep.VerifyTranslators &&
        renderHeaderGrid()}
      <div className="contact-request-page__grid__steps-container">
        <StepContents
          disableNext={disableNextCb}
          onDataChanged={() => setHasLocalChanges(true)}
        />
      </div>
      {showControlButtons && (
        <ControlButtons
          hasLocalChanges={hasLocalChanges}
          disableNext={disableNext}
        />
      )}
    </>
  );
  const renderDesktopView = () => (
    <>
      <Grid item>{renderHeaderGrid()}</Grid>
      <Grid className="contact-request-page__grid" item>
        <Paper elevation={3}>
          <div className="contact-request-page__grid__form-container">
            <div className="contact-request-page__grid__inner-container">
              <ContactRequestStepper />
              <StepContents
                disableNext={disableNextCb}
                onDataChanged={() => setHasLocalChanges(true)}
              />
            </div>
            {showControlButtons && (
              <ControlButtons
                hasLocalChanges={hasLocalChanges}
                disableNext={disableNext}
              />
            )}
          </div>
        </Paper>
      </Grid>
    </>
  );

  return (
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="contact-request-page"
    >
      {isPhone ? renderPhoneView() : renderDesktopView()}
    </Grid>
  );
};
