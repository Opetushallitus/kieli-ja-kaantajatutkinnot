import ArrowBackIosOutlined from '@mui/icons-material/ArrowBackIosOutlined';
import { FC } from 'react';
import { CustomButtonLink } from 'shared/components';
import { Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

export const TopControls: FC = () => {
  const translateCommon = useCommonTranslation();

  return (
    <div className="columns">
      <CustomButtonLink
        to={AppRoutes.ClerkHomePage}
        className="color-secondary-dark"
        variant={Variant.Text}
        startIcon={<ArrowBackIosOutlined />}
        data-testid="clerk-exam-event-overview-page__back-button"
      >
        {translateCommon('back')}
      </CustomButtonLink>
    </div>
  );
};
