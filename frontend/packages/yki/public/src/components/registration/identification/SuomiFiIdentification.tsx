import { CustomButton, H3, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { registrationSelector } from 'redux/selectors/registration';

export const SuomiFiIdentification = () => {
  const { context } = useAppSelector(registrationSelector);

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });

  return (
    <>
      <div className="rows">
        <H3>{t('withFinnishSSN.description')}</H3>
        <Text>{t('withFinnishSSN.info')}</Text>
      </div>
      <CustomButton
        className="public-registration__grid__form-container__registration-button"
        size="large"
        variant={Variant.Contained}
        color={Color.Secondary}
        href={context?.authentication_urls.suomifi}
      >
        {t('suomiFiButtonText')}
      </CustomButton>
    </>
  );
};
