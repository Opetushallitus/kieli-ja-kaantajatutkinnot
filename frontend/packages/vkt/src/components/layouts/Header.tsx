import { AppBar, Toolbar } from '@mui/material';
import { TFunction } from 'i18next';
import { Link, matchPath, useLocation, useParams } from 'react-router';
import {
  CookieBanner,
  LangSelector,
  MobileNavigationMenuWithPortal,
  NavigationLinks,
  OPHClerkLogo,
  OPHLogoViewer,
  SkipLink,
  Text,
} from 'shared/components';
import {
  APIResponseStatus,
  AppLanguage,
  Direction,
  I18nNamespace,
} from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { ClerkHeaderButtons } from 'components/layouts/clerkHeader/ClerkHeaderButtons';
import { ClerkNavigationLinks } from 'components/layouts/clerkHeader/ClerkNavigationLinks';
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
import { setMobileNavigationMenuState } from 'redux/reducers/mobileNavigationMenu';
import { loadPublicUser } from 'redux/reducers/publicUser';
import { featureFlagsSelector } from 'redux/selectors/featureFlags';
import { mobileNavigationMenuSelector } from 'redux/selectors/mobileNavigationMenu';

const isPathActive = (currentPath: string, route: AppRoutes) =>
  !!matchPath({ path: route, end: false }, currentPath);

const getNavigationLinks = (
  pathname: string,
  goodAndSatisfactoryLevel: boolean,
  translateCommon: TFunction<I18nNamespace, string>,
) => {
  const excellentLevelLink = {
    active: isPathActive(pathname, AppRoutes.PublicExcellentLevelLanding),
    label: translateCommon(
      `header.publicNavigationLinks.${PublicNavigationLink.ExcellentLevel}`,
    ),
    href: AppRoutes.PublicExcellentLevelLanding,
  };

  const homePageLink = {
    active: isPathActive(pathname, AppRoutes.PublicHomePage),
    label: translateCommon(
      `header.publicNavigationLinks.${PublicNavigationLink.FrontPage}`,
    ),
    href: AppRoutes.PublicHomePage,
  };

  const goodAndSatisfactoryPageLink = {
    active: isPathActive(
      pathname,
      AppRoutes.PublicGoodAndSatisfactoryLevelLanding,
    ),
    label: translateCommon(
      `header.publicNavigationLinks.${PublicNavigationLink.GoodAndSatisfactoryLevel}`,
    ),
    href: AppRoutes.PublicGoodAndSatisfactoryLevelLanding,
  };

  const navigationLinks = goodAndSatisfactoryLevel
    ? [homePageLink, excellentLevelLink, goodAndSatisfactoryPageLink]
    : [homePageLink, excellentLevelLink];

  return navigationLinks;
};

const PublicNavigationLinks = () => {
  const translateCommon = useCommonTranslation();
  const { pathname } = useLocation();
  const { goodAndSatisfactoryLevel } = useAppSelector(featureFlagsSelector);

  const navigationLinks = getNavigationLinks(
    pathname,
    !!goodAndSatisfactoryLevel,
    translateCommon,
  );

  return (
    <NavigationLinks
      navigationAriaLabel={translateCommon(
        'header.accessibility.mainNavigation',
      )}
      links={navigationLinks}
    />
  );
};

const PublicMobileNavigationMenu = () => {
  const translateCommon = useCommonTranslation();
  const { pathname } = useLocation();
  const { goodAndSatisfactoryLevel } = useAppSelector(featureFlagsSelector);

  const navigationLinks = getNavigationLinks(
    pathname,
    !!goodAndSatisfactoryLevel,
    translateCommon,
  );

  const { open } = useAppSelector(mobileNavigationMenuSelector);
  const dispatch = useAppDispatch();
  const setIsMenuOpen = (open: boolean) => {
    dispatch(setMobileNavigationMenuState(open));
  };

  const portalContainer = document.getElementById('mobile-menu-placeholder');

  if (!portalContainer) {
    return null;
  }

  return (
    <MobileNavigationMenuWithPortal
      navigationAriaLabel={translateCommon(
        'header.accessibility.mainNavigation',
      )}
      openStateLabel="Sulje"
      openStateAriaLabel="Sulje valikko"
      closedStateLabel="Valikko"
      closedStateAriaLabel="Avaa valikko"
      links={navigationLinks}
      portalContainer={portalContainer}
      isMenuOpen={open}
      setIsMenuOpen={setIsMenuOpen}
    />
  );
};

export const Header = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const params = useParams();
  const translateCommon = useCommonTranslation();
  const [finnish, swedish] = getSupportedLangs();

  const langDict = new Map<string, AppLanguage>([
    [translateCommon('header.lang.fi'), finnish],
    [translateCommon('header.lang.sv'), swedish],
  ]);

  const { isAuthenticated, isClerkUI, clerkUser, publicUser } =
    useAuthentication();
  const activeUrl = window.location.href;
  const isPublicUrl =
    !activeUrl.includes(AppRoutes.ClerkRoot) &&
    !activeUrl.includes(AppRoutes.ExaminerRoot);
  const oid = params.oid || '';
  const logoRedirectURL = isAuthenticated
    ? oid
      ? AppRoutes.ExaminerHomePage.replace(':oid', oid)
      : AppRoutes.ClerkExcellentLevelPage
    : AppRoutes.PublicHomePage;

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
          <div className="header__logo">
            <Link to={logoRedirectURL}>
              {isClerkUI ? (
                <OPHClerkLogo
                  mainLabel={translateCommon('appNameAbbreviation')}
                  subLabel={translateCommon('clerk')}
                  alt={translateCommon('ophLogoToFrontPageAlt')}
                />
              ) : (
                <OPHLogoViewer
                  className="header__logo__logo"
                  direction={Direction.Horizontal}
                  alt={translateCommon('ophLogoToFrontPageAlt')}
                  currentLang={getCurrentLang()}
                  title={
                    !isPhone
                      ? translateCommon('appNameAbbreviation')
                      : undefined
                  }
                />
              )}
            </Link>
          </div>
          <div className="header__navigation">
            {isAuthenticated && <ClerkNavigationLinks />}
            {isPublicUrl && !isPhone && <PublicNavigationLinks />}
            {isPublicUrl && isPhone && <PublicMobileNavigationMenu />}
          </div>
          <div className="header__language-select">
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
