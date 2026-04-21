import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Container, Grid, Paper } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { Trans } from 'react-i18next';
import {
  CustomButton,
  H1,
  H2,
  HeaderSeparator,
  Text,
  WebLink,
} from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { SelectIdentificationMethod } from 'components/registration/identification/SelectIdentificationMethod';
import { PublicRegistrationControlButtons } from 'components/registration/PublicRegistrationControlButtons';
import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { PublicRegistrationStepper } from 'components/registration/PublicRegistrationStepper';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, RegistrationKind } from 'enums/app';
import { ExamSession } from 'interfaces/examSessions';
import { cancelRegistration } from 'redux/reducers/registration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';
import { sessionSelector } from 'redux/selectors/session';
import { ExamSessionUtils } from 'utils/examSession';

const AlreadyLoggedIn = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });
  const dispatch = useAppDispatch();
  const { loggedInSession } = useAppSelector(sessionSelector);
  const examSession = useAppSelector(examSessionSelector)
    .examSession as ExamSession;
  const { initRegistration } = useAppSelector(registrationSelector);
  const isSuomiFiAuthenticatedSession =
    loggedInSession?.['auth-method'] === 'SUOMIFI';
  const isEmailAuthenticatedSession =
    loggedInSession?.['auth-method'] === 'EMAIL';
  const toQueue =
    examSession.available_registration_kind === RegistrationKind.Queue;
  const onAbort = () => {
    dispatch(cancelRegistration());
  };

  return (
    <>
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
            {`${loggedInSession.identity['external-user-id']}`}
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
          href={`${(toQueue
            ? AppRoutes.ExamSessionQueue
            : AppRoutes.ExamSessionRegistration
          ).replace(/:examSessionId/, `${examSession.id}`)}?registrationId=${
            initRegistration.registrationId
          }`}
        >
          <span className="button-color-white">
            {t('alreadyLoggedIn.labels.continueToRegistration')}
          </span>
        </CustomButton>
        <CustomButton
          aria-label={t('alreadyLoggedIn.labels.abort')}
          variant={Variant.Text}
          color={Color.Secondary}
          className="fit-content-max-width"
          size="large"
          href={AppRoutes.Registration}
          onClick={onAbort}
        >
          {t('alreadyLoggedIn.labels.abort')}
        </CustomButton>
      </div>
    </>
  );
};

const FreeRegistrationInfoBox = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify.freeRegistration',
  });

  return (
    <Container className="public-registration__info-box rows gapped-sm">
      <H2>{t('heading')}</H2>
      <div className="rows">
        <Text>{t('conditions.general')}:</Text>
        <ul>
          {['point1', 'point2', 'point3'].map((v) => (
            <Text key={v}>
              <li>{t('conditions.' + v)}</li>
            </Text>
          ))}
        </ul>
      </div>
      <Text>{t('threeAttemptsAvailable')}</Text>
      <Text>
        <b>{t('suomiFiAuthenticationRequired')}</b>{' '}
        {t('educationDetailsAreChecked')} {t('ifSuitableEducationIsNotFound')}
      </Text>
      <Text>
        {t('readMore.text')}:{' '}
        <WebLink
          label={t('readMore.link.label')}
          href={t('readMore.link.url')}
          endIcon={<OpenInNewIcon color="inherit" />}
        />
      </Text>
    </Container>
  );
};

const Identify = () => {
  return (
    <div className="gapped rows">
      <SelectIdentificationMethod />
      <PublicRegistrationControlButtons />
    </div>
  );
};

export const PublicIdentificationGrid = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });
  const { isPhone } = useWindowProperties();

  const { registrationKind } =
    useAppSelector(registrationSelector).initRegistration;
  const { examSession } = useAppSelector(examSessionSelector);
  const { loggedInSession } = useAppSelector(sessionSelector);

  if (!registrationKind) {
    return null;
  }
  const toQueue = registrationKind === RegistrationKind.Queue;

  return (
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="public-registration"
    >
      <Grid className="public-registration">
        <div className="public-registration__grid">
          <div className="rows gapped-xxl">
            <PublicRegistrationStepper />
            <div className="rows public-registration__grid__heading">
              <H1>
                {toQueue
                  ? t('titleForQueueing')
                  : loggedInSession
                  ? t('alreadyLoggedIn.title')
                  : t('title')}
              </H1>
              <HeaderSeparator />
            </div>
          </div>
          <Paper
            elevation={isPhone ? 0 : 3}
            style={isPhone ? {} : { borderTop: '5px solid' + ophColors.green2 }}
          >
            <div className="public-registration__grid__form-container">
              <div className="rows gapped">
                <PublicRegistrationExamSessionDetails
                  examSession={examSession}
                  showOpenings={true}
                />
                <Text>
                  <Trans t={t} i18nKey="registrationIsBindingAdvisory" />
                </Text>
                {examSession &&
                  ExamSessionUtils.freeRegistrationPossible(examSession) && (
                    <FreeRegistrationInfoBox />
                  )}
                {loggedInSession ? <AlreadyLoggedIn /> : <Identify />}
              </div>
            </div>
          </Paper>
        </div>
      </Grid>{' '}
    </Grid>
  );
};
