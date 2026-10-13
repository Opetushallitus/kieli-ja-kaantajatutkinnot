import { CustomButton } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { RegistrationRoutes } from 'features/registration/routes';

export const BackToFrontPageButton = () => {
  const translateCommon = useCommonTranslation();

  return (
    <CustomButton
      className="fit-content-max-width"
      color={Color.Secondary}
      variant={Variant.Contained}
      href={RegistrationRoutes.Registration}
    >
      {translateCommon('backToHomePage')}
    </CustomButton>
  );
};
