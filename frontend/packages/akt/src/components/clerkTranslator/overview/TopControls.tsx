import ArrowBackIosOutlined from '@mui/icons-material/ArrowBackIosOutlined';

import { CustomButtonLink } from 'components/elements/CustomButtonLink';
import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes, Variant } from 'enums/app';

export const TopControls = () => {
  const translateCommon = useCommonTranslation();

  return (
    <div className="columns">
      <CustomButtonLink
        to={AppRoutes.ClerkHomePage}
        className="color-secondary-dark"
        variant={Variant.Text}
        startIcon={<ArrowBackIosOutlined />}
        data-testid="clerk-translator-overview-page__back-btn"
      >
        {translateCommon('back')}
      </CustomButtonLink>
    </div>
  );
};
