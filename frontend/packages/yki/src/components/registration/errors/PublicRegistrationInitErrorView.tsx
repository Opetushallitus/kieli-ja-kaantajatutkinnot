import { CustomButton, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicRegistrationInitError } from 'enums/publicRegistration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';

const DescribeInitError = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.unavailable',
  });

  const error = useAppSelector(registrationSelector).initRegistration
    .error as PublicRegistrationInitError;

  switch (error) {
    // TODO The designs for the "already registered" case are much more complex
    //  than the current implementation.
    case PublicRegistrationInitError.AlreadyRegistered:
      return <Text>{t('alreadyRegistered.description')}</Text>;
    case PublicRegistrationInitError.ExamSessionFull:
    case PublicRegistrationInitError.Past:
    case PublicRegistrationInitError.Upcoming:
    default:
      return <Text>{t(error + '.description')}</Text>;
  }
};

export const PublicRegistrationInitErrorView = () => {
  const translateCommon = useCommonTranslation();
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
        <CustomButton
          className="fit-content-max-width"
          color={Color.Secondary}
          variant={Variant.Contained}
          href={AppRoutes.Registration}
        >
          {translateCommon('backToHomePage')}
        </CustomButton>
      </div>
    </div>
  );
};
