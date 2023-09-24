import { CustomButton, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicRegistrationInitError } from 'enums/publicRegistration';
import { registrationSelector } from 'redux/selectors/registration';

const DescribeInitError = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.unavailable',
  });

  const error = useAppSelector(registrationSelector).initRegistration
    .error as PublicRegistrationInitError;

  switch (error) {
    case PublicRegistrationInitError.ExamSessionFull:
      return <Text>{t('full.description')}</Text>;
    case PublicRegistrationInitError.RegistrationPeriodClosed:
      return <Text>{t('past.description')}</Text>;
    // TODO The designs for the "already registered" case are much more complex
    //  than the current implementation.
    case PublicRegistrationInitError.AlreadyRegistered:
      return <Text>{t('alreadyRegistered.description')}</Text>;
  }
};

export const PublicRegistrationInitErrorView = () => {
  const translateCommon = useCommonTranslation();

  return (
    <div className="rows gapped margin-top-xxl">
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
  );
};
