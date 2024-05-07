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

import { ClerkHeaderButtons } from 'components/layouts/clerkHeader/ClerkHeaderButtons';
import { ClerkNavTabs } from 'components/layouts/clerkHeader/ClerkNavTabs';
import { SessionExpiredModal } from 'components/layouts/SessionExpiredModal';
import { SessionStateHeader } from 'components/layouts/SessionStateHeader';
import {
  changeLang,
  getCurrentLang,
  getSupportedLangs,
  useCommonTranslation,
} from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { useAuthentication } from 'hooks/useAuthentication';
import { useInterval } from 'hooks/useInterval';
import { loadClerkUser } from 'redux/reducers/clerkUser';
import { loadPublicUser } from 'redux/reducers/publicUser';

export const Header = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const translateCommon = useCommonTranslation();
  const [finnish, swedish] = getSupportedLangs();

  const langDict = new Map<string, AppLanguage>([
    [translateCommon('header.lang.fi'), finnish],
    [translateCommon('header.lang.sv'), swedish],
  ]);

  const { isAuthenticated, isClerkUI, publicUser } = useAuthentication();
  const logoRedirectURL = isAuthenticated
    ? AppRoutes.ClerkHomePage
    : AppRoutes.PublicHomePage;
  const { isPhone } = useWindowProperties();

  const heartBeat = () => {
    if (isAuthenticated || publicUser?.isAuthenticated) {
      if (!document.hidden) {
        dispatch(isClerkUI ? loadClerkUser() : loadPublicUser());
      }
    }
  };

  useInterval(heartBeat, 5000); // Every 5 seconds

  return (
    <>
      {isClerkUI && !isAuthenticated && <SessionExpiredModal isClerkUI />}
      <SkipLink
        href="#main-content"
        text={translateCommon('header.accessibility.continueToMain')}
      />
      <AppBar className="header" position="static">
        {isPhone && (
          <Toolbar className="header__toolbar header__toolbar__mobile-lang-select">
            <LangSelector
              changeLang={changeLang}
              getCurrentLang={getCurrentLang}
              langDict={langDict}
              langSelectorAriaLabel={translateCommon(
                'header.accessibility.langSelectorAriaLabel',
              )}
            />
          </Toolbar>
        )}
        {publicUser?.isAuthenticated && (
          <SessionStateHeader
            firstName={publicUser.firstName}
            lastName={publicUser.lastName}
          />
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
                langSelectorAriaLabel={translateCommon(
                  'header.accessibility.langSelectorAriaLabel',
                )}
              />
            )}
          </div>
        </Toolbar>
      </AppBar>
      {!isClerkUI && (
        <CookieBanner
          title={translateCommon('cookieBanner.title')}
          buttonText={translateCommon('cookieBanner.buttonText')}
          cookieTag="cookie-consent-vkt"
          buttonAriaLabel={translateCommon('cookieBanner.buttonAriaLabel')}
          path="/vkt"
        >
          <Text data-testid="cookie-banner-description">
            {translateCommon('cookieBanner.description')}
          </Text>
        </CookieBanner>
      )}
    </>
  );
};
