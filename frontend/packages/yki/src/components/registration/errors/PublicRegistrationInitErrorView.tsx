import { CustomButton, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { BackToFrontPageButton } from 'components/elements/BackToFrontPageButton';
import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicRegistrationInitError } from 'enums/publicRegistration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';

const DescribeInitError = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.unavailable',
  });

  const error = useAppSelector(registrationSelector).initRegistration.error;

  switch (error) {
    case PublicRegistrationInitError.AlreadyRegistered:
      return <Text>{t('alreadyRegistered.description')}</Text>;
    case PublicRegistrationInitError.ExamSessionFull:
    case PublicRegistrationInitError.Past:
    case PublicRegistrationInitError.Unauthorized:
    case PublicRegistrationInitError.Upcoming:
      return <Text>{t(error + '.description')}</Text>;
    default:
      return <Text>{t('generic.description')}</Text>;
  }
};

const BackToIdentificationButton = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.unavailable.unauthorized',
  });
  const { examSession } = useAppSelector(examSessionSelector);

  return (
    <CustomButton
      className="fit-content-max-width"
      color={Color.Secondary}
      variant={Variant.Contained}
      href={AppRoutes.ExamSession.replace(
        /:examSessionId/,
        `${examSession?.id}`,
      )}
    >
      {t('backToIdentification')}
    </CustomButton>
  );
};

export const PublicRegistrationInitErrorView = () => {
  const { examSession } = useAppSelector(examSessionSelector);
  const { error } = useAppSelector(registrationSelector).initRegistration;
  const showExamSessionDetails =
    error === PublicRegistrationInitError.ExamSessionFull ||
    error === PublicRegistrationInitError.Past ||
    error === PublicRegistrationInitError.Upcoming;

  return (
    <div className="public-registration__grid__form-container">
      {showExamSessionDetails ? (
        <PublicRegistrationExamSessionDetails
          examSession={examSession}
          showOpenings={true}
        />
      ) : null}
      <div
        className={
          'rows gapped' + (showExamSessionDetails ? ' margin-top-xxl' : '')
        }
      >
        <DescribeInitError />
        {error === PublicRegistrationInitError.Unauthorized ? (
          <BackToIdentificationButton />
        ) : (
          <BackToFrontPageButton />
        )}
      </div>
    </div>
  );
};
