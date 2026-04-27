import { CustomButton } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { clerkEnabled } from 'featureFlags';

export const BackToFrontPageButton = () => {
  const translateCommon = useCommonTranslation();

  return clerkEnabled ? (
    <CustomButton
      className="fit-content-max-width"
      color={Color.Secondary}
      variant={Variant.Contained}
      href={AppRoutes.Registration}
    >
      {translateCommon('backToHomePage')}
    </CustomButton>
  ) : (
    <CustomButton
      className="fit-content-max-width"
      color={Color.Secondary}
      variant={Variant.Contained}
      href={AppRoutes.Registration}
    >
      {translateCommon('backToHomePage')}
    </CustomButton>
  );
};
