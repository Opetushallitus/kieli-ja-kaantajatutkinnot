import { AppBar, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  CookieBanner,
  LangSelector,
  OPHClerkLogo,
  OPHLogoViewer,
  SkipLink,
  Text,
} from 'shared/components';
import { AppLanguage, Direction } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { ClerkNavTabs } from 'components/layouts//clerkHeader/ClerkNavTabs';
import { ClerkHeaderButtons } from 'components/layouts/clerkHeader/ClerkHeaderButtons';
import {
  changeLang,
  getCurrentLang,
  getSupportedLangs,
  useAppTranslation,
  useCommonTranslation,
} from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { useAuthentication } from 'hooks/useAuthentication';

export const Header = (): JSX.Element => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.header',
  });
  const { t: cookieTranslation } = useAppTranslation({
    keyPrefix: 'akr.pages.homepage.cookieBanner',
  });
  const translateCommon = useCommonTranslation();
  const [finnish, swedish, english] = getSupportedLangs();

  const langDict = new Map<string, AppLanguage>([
    [t('lang.fi'), finnish],
    [t('lang.sv'), swedish],
    [t('lang.en'), english],
  ]);

  const { isPhone } = useWindowProperties();
  const { isAuthenticated, isClerkUI } = useAuthentication();
  const logoRedirectURL = isAuthenticated
    ? AppRoutes.ClerkHomePage
    : AppRoutes.PublicHomePage;

  return (
    <>
      <SkipLink href="#main-content" text={t('accessibility.continueToMain')} />
      <AppBar className="header" position="static">
        {isPhone && (
          <Toolbar className="header__toolbar header__toolbar__mobile-lang-select">
            <LangSelector
              changeLang={changeLang}
              getCurrentLang={getCurrentLang}
              langDict={langDict}
              langSelectorAriaLabel={t('accessibility.langSelectorAriaLabel')}
            />
          </Toolbar>
        )}
        <Toolbar className="header__toolbar">
          <div className="header__left">
            <Link to={logoRedirectURL}>
              {isClerkUI ? (
                <OPHClerkLogo
                  mainLabel={translateCommon('appNameAbbreviation')}
                  subLabel={translateCommon('clerk')}
                  alt={translateCommon('ophLogoToFrontPageAlt')}
                />
              ) : (
                <OPHLogoViewer
                  className="header__left__logo"
                  direction={Direction.Horizontal}
                  alt={translateCommon('ophLogoToFrontPageAlt')}
                  currentLang={getCurrentLang()}
                  title={translateCommon('appNameAbbreviation')}
                />
              )}
            </Link>
          </div>
          <div className="header__center">
            {isAuthenticated && <ClerkNavTabs />}
          </div>
          <div className="header__right">
            {isAuthenticated && <ClerkHeaderButtons />}
            {!isPhone && (
              <LangSelector
                changeLang={changeLang}
                getCurrentLang={getCurrentLang}
                langDict={langDict}
                langSelectorAriaLabel={t('accessibility.langSelectorAriaLabel')}
              />
            )}
          </div>
        </Toolbar>
      </AppBar>
      {!isClerkUI && (
        <CookieBanner
          title={cookieTranslation('title')}
          buttonText={cookieTranslation('buttonText')}
          cookieTag="cookie-consent-akr"
          buttonAriaLabel={cookieTranslation('buttonAriaLabel')}
          path="/akr"
        >
          <Text data-testid="cookie-banner-description">
            {cookieTranslation('description')}
          </Text>
        </CookieBanner>
      )}
    </>
  );
};
