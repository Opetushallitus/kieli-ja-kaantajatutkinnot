import ArrowBackIosOutlined from '@mui/icons-material/ArrowBackIosOutlined';
import { CustomButtonLink } from 'shared/components';
import { Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

export const BackButton = ({
  to = AppRoutes.ClerkHomePage,
}: {
  to?: AppRoutes;
}) => {
  const translateCommon = useCommonTranslation();

  return (
    <div className="columns">
      <CustomButtonLink
        to={to}
        className="color-secondary-dark"
        variant={Variant.Text}
        startIcon={<ArrowBackIosOutlined />}
        data-testid="back-button"
      >
        {translateCommon('back')}
      </CustomButtonLink>
    </div>
  );
};
