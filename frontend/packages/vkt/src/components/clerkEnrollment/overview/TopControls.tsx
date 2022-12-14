import ArrowBackIosOutlined from '@mui/icons-material/ArrowBackIosOutlined';
import { FC } from 'react';
import { CustomButtonLink } from 'shared/components';
import { Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

interface TopControlsProps {
  examEventId: number;
}

export const TopControls: FC<TopControlsProps> = ({ examEventId }) => {
  const translateCommon = useCommonTranslation();

  const to = AppRoutes.ClerkExamEventOverviewPage.replace(
    /:examEventId$/,
    `${examEventId}`
  );

  return (
    <div className="columns">
      <CustomButtonLink
        to={to}
        className="color-secondary-dark"
        variant={Variant.Text}
        startIcon={<ArrowBackIosOutlined />}
        data-testid="clerk-enrollment-overview-page__back-button"
      >
        {translateCommon('back')}
      </CustomButtonLink>
    </div>
  );
};
