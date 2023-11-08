import { FC } from 'react';
import { CustomButton, H1, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

const NotFoundPage: FC = () => {
  const translateCommon = useCommonTranslation();

  return (
    <div className="not-found-page">
      <H1>{translateCommon('notFoundPage.title')}</H1>
      <Text>{translateCommon('notFoundPage.description')}</Text>
      <CustomButton
        className="not-found-page__btn"
        color={Color.Secondary}
        variant={Variant.Contained}
        href={AppRoutes.PublicHomePage}
      >
        {translateCommon('backToHomePage')}
      </CustomButton>
    </div>
  );
};

export default NotFoundPage;
