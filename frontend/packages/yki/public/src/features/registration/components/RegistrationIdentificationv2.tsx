import { Button } from '@mui/material';
import { ReactNode } from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router';
import { CustomButton, H2, H3, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { EmailIdentificationForm } from 'components/registration/identification/EmailIdentification';
import { FreeRegistrationInfoBox } from 'components/registration/PublicIdentificationGrid';
import { usePublicTranslation } from 'configs/i18n';
import { RegistrationControls } from 'features/registration/components/RegistrationControlsv2';
import { PublicRegistrationInitResponse } from 'features/registration/modelv2';
import { stepPath } from 'features/registration/routesv2';
import { ExamSession } from 'interfaces/examSessions';
import { ExamSessionUtils } from 'utils/examSession';

export const RegistrationIdentification = ({
  context,
  examSession,
  cancel,
}: {
  context: PublicRegistrationInitResponse;
  examSession?: ExamSession;
  cancel: ReactNode;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });
  const identity = context.session.identity;

  return (
    <>
      <Text>
        <Trans t={t} i18nKey="registrationIsBindingAdvisory" />
      </Text>
      {examSession &&
        ExamSessionUtils.freeRegistrationPossible(examSession) && (
          <FreeRegistrationInfoBox />
        )}
      {identity ? (
        <>
          <H2>{t('alreadyLoggedIn.caption')}</H2>
          <Text>{t('alreadyLoggedIn.currentLoginInformation')}</Text>
          <Text>
            <strong>
              {t(
                context.is_strongly_identified
                  ? 'alreadyLoggedIn.labels.name'
                  : 'alreadyLoggedIn.labels.email',
              )}
              :
            </strong>
            &nbsp;
            {context.session['auth-method'] === 'SUOMIFI'
              ? `${context.session.identity.first_name} ${context.session.identity.last_name}`
              : context.session['auth-method'] === 'EMAIL'
                ? context.session.identity['external-user-id']
                : ''}
          </Text>
          <Text>{t('alreadyLoggedIn.reauthenticate')}</Text>
          <div className="rows gapped-xs align-items-center">
            <Button
              component={Link}
              variant={Variant.Contained}
              color={Color.Secondary}
              className="fit-content-max-width"
              size="large"
              to={stepPath('Register', {
                examSessionId: context.exam_session.id,
                registrationId: context.registration_id,
              })}
            >
              {t('alreadyLoggedIn.labels.continueToRegistration')}
            </Button>
            {cancel}
          </div>
        </>
      ) : (
        <div className="rows gapped">
          <H2>{t('selectIdentificationMethod')}</H2>
          <Text>{t('caption')}</Text>
          <div className="rows">
            <H3>{t('withFinnishSSN.description')}</H3>
            <Text>{t('withFinnishSSN.info')}</Text>
          </div>
          <CustomButton
            className="public-registration__grid__form-container__registration-button"
            size="large"
            variant={Variant.Contained}
            color={Color.Secondary}
            href={context.authentication_urls.suomifi}
          >
            {t('suomiFiButtonText')}
          </CustomButton>
          <EmailIdentificationForm
            isFreeRegistrationPossible={
              !!examSession &&
              ExamSessionUtils.freeRegistrationPossible(examSession)
            }
            onOrder={(email) => {
              const url = new URL(
                context.authentication_urls.email,
                window.location.origin,
              );
              url.searchParams.set('email', email);
              window.location.assign(url.toString());
            }}
          />
          <RegistrationControls submit={null} cancel={cancel} deadline={null} />
        </div>
      )}
    </>
  );
};
