import { CustomButton } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

export const BackToFrontPageButton = () => {
  const translateCommon = useCommonTranslation();

  return (
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
