import { AppBar, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  LangSelector,
  OPHClerkLogo,
  OPHLogoViewer,
  SkipLink,
} from 'shared/components';
import { AppLanguage, Direction } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { ClerkHeaderButtons } from 'components/layouts/clerkHeader/ClerkHeaderButtons';
import { ClerkNavTabs } from 'components/layouts/clerkHeader/ClerkNavTabs';
import {
  changeLang,
  getCurrentLang,
  getSupportedLangs,
  useCommonTranslation,
} from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { useAuthentication } from 'hooks/useAuthentication';

export const Header = (): JSX.Element => {
  const translateCommon = useCommonTranslation();
  const [finnish, swedish] = getSupportedLangs();

  const langDict = new Map<string, AppLanguage>([
    [translateCommon('header.lang.fi'), finnish],
    [translateCommon('header.lang.sv'), swedish],
  ]);

  const { isAuthenticated, isClerkUI } = useAuthentication();
  const logoRedirectURL = isAuthenticated
    ? AppRoutes.ClerkHomePage
    : AppRoutes.PublicHomePage;
  const { isPhone } = useWindowProperties();

  return (
    <>
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
                'header.accessibility.langSelectorAriaLabel'
              )}
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
                langSelectorAriaLabel={translateCommon(
                  'header.accessibility.langSelectorAriaLabel'
                )}
              />
            )}
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
};
