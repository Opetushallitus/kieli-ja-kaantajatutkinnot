import { Grid, Paper } from '@mui/material';
import { CustomButton, H1, H2, HeaderSeparator, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { SelectIdentificationMethod } from 'components/registration/identification/SelectIdentificationMethod';
import { PublicRegistrationControlButtons } from 'components/registration/PublicRegistrationControlButtons';
import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { PublicRegistrationStepper } from 'components/registration/PublicRegistrationStepper';
import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { ExamSession } from 'interfaces/examSessions';
import { examSessionSelector } from 'redux/selectors/examSession';
import { sessionSelector } from 'redux/selectors/session';

const AlreadyLoggedIn = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });
  const { loggedInSession } = useAppSelector(sessionSelector);
  const examSession = useAppSelector(examSessionSelector)
    .examSession as ExamSession;
  const isSuomiFiAuthenticatedSession =
    loggedInSession?.['auth-method'] === 'SUOMIFI';
  const isEmailAuthenticatedSession =
    loggedInSession?.['auth-method'] === 'EMAIL';

  return (
    <>
      <Text>{t('registrationIsBindingAdvisory')}</Text>
      <H2>{t('alreadyLoggedIn.caption')}</H2>
      <Text> {t('alreadyLoggedIn.currentLoginInformation')}</Text>
      <Text>
        {isSuomiFiAuthenticatedSession && (
          <>
            <strong>{t('alreadyLoggedIn.labels.name') + ':'}</strong>
            &nbsp;
            {`${loggedInSession.identity.first_name} ${loggedInSession.identity.last_name}`}
          </>
        )}
        {isEmailAuthenticatedSession && (
          <>
            <strong>{t('alreadyLoggedIn.labels.email') + ':'}</strong>
            &nbsp;
            {`${loggedInSession.identity.email}`}
          </>
        )}
      </Text>
      <Text>{t('alreadyLoggedIn.reauthenticate')}</Text>
      <div className="rows gapped-xs align-items-center">
        <CustomButton
          aria-label={t('alreadyLoggedIn.labels.continueToRegistration')}
          variant={Variant.Contained}
          color={Color.Secondary}
          className="fit-content-max-width"
          size="large"
          href={AppRoutes.ExamSessionRegistration.replace(
            /:examSessionId/,
            `${examSession.id}`,
          )}
        >
          {t('alreadyLoggedIn.labels.continueToRegistration')}
        </CustomButton>
        <CustomButton
          aria-label={t('alreadyLoggedIn.labels.abort')}
          variant={Variant.Text}
          color={Color.Secondary}
          className="fit-content-max-width"
          size="large"
          href={AppRoutes.Registration}
        >
          {t('alreadyLoggedIn.labels.abort')}
        </CustomButton>
      </div>
    </>
  );
};

const Identify = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });

  return (
    <>
      <Text>{t('registrationIsBindingAdvisory')}</Text>
      <div className="gapped rows">
        <SelectIdentificationMethod />
        <PublicRegistrationControlButtons />
      </div>
    </>
  );
};

export const PublicIdentificationGrid = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });
  const { isPhone } = useWindowProperties();

  const { examSession } = useAppSelector(examSessionSelector);
  const { loggedInSession } = useAppSelector(sessionSelector);

  if (!examSession) {
    return null;
  }

  return (
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="public-registration"
    >
      <Grid className="public-registration" item>
        <div className="public-registration__grid">
          <div className="rows gapped-xxl">
            <PublicRegistrationStepper />
            <div className="rows public-registration__grid__heading">
              <H1>
                {loggedInSession ? t('alreadyLoggedIn.title') : t('title')}
              </H1>
              <HeaderSeparator />
            </div>
          </div>
          <Paper elevation={isPhone ? 0 : 3}>
            <div className="public-registration__grid__form-container">
              <div className="rows gapped">
                <PublicRegistrationExamSessionDetails
                  examSession={examSession}
                  showOpenings={true}
                />
                {loggedInSession ? <AlreadyLoggedIn /> : <Identify />}
              </div>
            </div>
          </Paper>
        </div>
      </Grid>{' '}
    </Grid>
  );
};
