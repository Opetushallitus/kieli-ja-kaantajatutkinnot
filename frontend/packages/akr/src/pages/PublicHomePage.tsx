import { Box, Grid } from '@mui/material';
import { FC, useEffect } from 'react';
import { CookieBanner, Text } from 'shared/components';

import { AkrLangSelector } from 'components/common/AkrLangSelector';
import { PublicTranslatorGrid } from 'components/publicTranslator/PublicTranslatorGrid';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicUIViews } from 'enums/app';
import { ContactRequestPage } from 'pages/ContactRequestPage';
import { loadPublicTranslators } from 'redux/reducers/publicTranslator';
import { publicUIViewSelector } from 'redux/selectors/publicUIView';

export const PublicHomePage: FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useAppTranslation({
    keyPrefix: 'akr.pages.homepage.cookieBanner',
  });

  useEffect(() => {
    dispatch(loadPublicTranslators());
  }, [dispatch]);

  const { currentView } = useAppSelector(publicUIViewSelector);

  return (
    <Box className="public-homepage">
      <CookieBanner
        title={t('title')}
        buttonText={t('buttonText')}
        cookieTag="cookie-consent-akr"
        buttonAriaLabel={t('buttonAriaLabel')}
        path="/akr"
        languageSelector={<AkrLangSelector usage="dialog" />}
      >
        <Text data-testid="cookie-banner-description">{t('description')}</Text>
      </CookieBanner>
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        {currentView == PublicUIViews.ContactRequest ? (
          <ContactRequestPage />
        ) : (
          <PublicTranslatorGrid />
        )}
      </Grid>
    </Box>
  );
};
