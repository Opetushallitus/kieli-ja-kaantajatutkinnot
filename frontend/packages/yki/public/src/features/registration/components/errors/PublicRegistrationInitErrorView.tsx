import { CustomButton } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { Text } from 'components/Text';
import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PublicRegistrationInitError } from 'enums/publicRegistration';
import { BackToFrontPageButton } from 'features/registration/components/elements/BackToFrontPageButton';
import { PublicRegistrationExamSessionDetails } from 'features/registration/components/PublicRegistrationExamSessionDetails';
import { examSessionSelector } from 'features/registration/redux/selectors/examSession';
import { registrationSelector } from 'features/registration/redux/selectors/registration';
import { RegistrationRoutes } from 'features/registration/routes';
import { PublicRegistrationInitErrorState } from 'interfaces/publicRegistration';

const DescribeInitError = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.unavailable',
  });

  const { error } = useAppSelector(registrationSelector).initRegistration
    .error as PublicRegistrationInitErrorState;

  switch (error) {
    case PublicRegistrationInitError.AlreadyRegistered:
      return (
        <>
          <Text>{t('alreadyRegistered.description1')}</Text>
          <Text>{t('alreadyRegistered.description2')}</Text>
        </>
      );
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
  const { registrationId, examSessionId } =
    useAppSelector(registrationSelector).initRegistration;

  return (
    <CustomButton
      className="fit-content-max-width"
      color={Color.Secondary}
      variant={Variant.Contained}
      href={
        registrationId
          ? `${RegistrationRoutes.ExamSession.replace(
              /:examSessionId/,
              `${examSession?.id ?? examSessionId}`,
            )}?registrationId=${registrationId}`
          : RegistrationRoutes.ExamSession.replace(
              /:examSessionId/,
              `${examSession?.id ?? examSessionId}`,
            )
      }
    >
      {t('backToIdentification')}
    </CustomButton>
  );
};

export const PublicRegistrationInitErrorView = () => {
  const { examSession } = useAppSelector(examSessionSelector);
  const { error } = useAppSelector(registrationSelector).initRegistration
    .error as PublicRegistrationInitErrorState;
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
