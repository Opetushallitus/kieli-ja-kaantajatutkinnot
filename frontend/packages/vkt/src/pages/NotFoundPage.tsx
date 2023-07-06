import { FC } from 'react';
import { CustomButton, H1, Text } from 'shared/components';

import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

export const NotFoundPage: FC = () => {
  const translateCommon = useCommonTranslation();

  return (
    <div className="not-found-page">
      <H1>{translateCommon('pageTitle.notFound')}</H1>
      <Text>{translateCommon('notFoundPage.description')}</Text>
      <CustomButton
        className="margin-top-lg not-found-page__btn"
        color="secondary"
        variant="contained"
        href={AppRoutes.PublicHomePage}
      >
        {translateCommon('pageTitle.frontPage')}
      </CustomButton>
    </div>
  );
};
