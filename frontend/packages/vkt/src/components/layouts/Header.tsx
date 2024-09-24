import { AppBar, Toolbar } from '@mui/material';
import { Link, matchPath, useLocation } from 'react-router-dom';
import {
  CookieBanner,
  LangSelector,
  NavigationLinks,
  OPHClerkLogo,
  OPHLogoViewer,
  SkipLink,
  Text,
} from 'shared/components';
import { APIResponseStatus, AppLanguage, Direction } from 'shared/enums';
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
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, PublicNavigationLink } from 'enums/app';
import { useAuthentication } from 'hooks/useAuthentication';
import { useInterval } from 'hooks/useInterval';
import { loadClerkUser } from 'redux/reducers/clerkUser';
import { loadPublicUser } from 'redux/reducers/publicUser';
import { featureFlagsSelector } from 'redux/selectors/featureFlags';

const isPathActive = (currentPath: string, route: AppRoutes) =>
  !!matchPath({ path: route, end: false }, currentPath);

const PublicNavigationLinks = () => {
  const translateCommon = useCommonTranslation();
  const { pathname } = useLocation();
  const { goodAndSatisfactoryLevel } = useAppSelector(featureFlagsSelector);
  const excellentLevelLink = {
    active: isPathActive(pathname, AppRoutes.PublicExcellentLevelLanding),
    label: translateCommon(
      `header.publicNavigationLinks.${PublicNavigationLink.ExcellentLevel}`,
    ),
    href: AppRoutes.PublicExcellentLevelLanding,
  };

  const navigationLinks = goodAndSatisfactoryLevel
    ? [
        {
          active: isPathActive(pathname, AppRoutes.PublicHomePage),
          label: translateCommon(
            `header.publicNavigationLinks.${PublicNavigationLink.FrontPage}`,
          ),
          href: AppRoutes.PublicHomePage,
        },
        excellentLevelLink,
        {
          active: isPathActive(
            pathname,
            AppRoutes.PublicGoodAndSatisfactoryLevelLanding,
          ),
          label: translateCommon(
            `header.publicNavigationLinks.${PublicNavigationLink.GoodAndSatisfactoryLevel}`,
          ),
          href: AppRoutes.PublicGoodAndSatisfactoryLevelLanding,
        },
      ]
    : [excellentLevelLink];

  return (
    <NavigationLinks
      navigationAriaLabel={translateCommon(
        'header.accessibility.mainNavigation',
      )}
      links={navigationLinks}
    />
  );
};

export const Header = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const translateCommon = useCommonTranslation();
  const [finnish, swedish] = getSupportedLangs();

  const langDict = new Map<string, AppLanguage>([
    [translateCommon('header.lang.fi'), finnish],
    [translateCommon('header.lang.sv'), swedish],
  ]);

  const { isAuthenticated, isClerkUI, clerkUser, publicUser } =
    useAuthentication();
  const goodAndSatisfactoryLevelSupported =
    useAppSelector(featureFlagsSelector).goodAndSatisfactoryLevel;
  const logoRedirectURL = isAuthenticated
    ? AppRoutes.ClerkHomePage
    : AppRoutes.PublicHomePage;
  const activeUrl = window.location.href;
  const isPublicUrl = !activeUrl.includes(AppRoutes.ClerkHomePage);
  const { isPhone } = useWindowProperties();

  const isClerkAuthenticationValid =
    clerkUser.status == APIResponseStatus.NotStarted ||
    clerkUser.status == APIResponseStatus.InProgress ||
    clerkUser.isAuthenticated;

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
      {isClerkUI && !isClerkAuthenticationValid && (
        <SessionExpiredModal isClerkUI />
      )}
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
            {isPublicUrl && goodAndSatisfactoryLevelSupported && (
              <PublicNavigationLinks />
            )}
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
