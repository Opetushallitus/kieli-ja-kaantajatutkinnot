import { AppBar, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  LangSelector,
  OPHClerkLogo,
  OPHLogoViewer,
  SkipLink,
} from 'shared/components';
import { AppLanguage, Direction } from 'shared/enums';

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
  const [finnish, swedish, english] = getSupportedLangs();

  const langDict = new Map<string, AppLanguage>([
    [translateCommon('header.lang.fi'), finnish],
    [translateCommon('header.lang.sv'), swedish],
    [translateCommon('header.lang.en'), english],
  ]);

  const { isAuthenticated, isClerkUI } = useAuthentication();
  const logoRedirectURL = isAuthenticated
    ? AppRoutes.ClerkHomePage
    : AppRoutes.PublicHomePage;

  return (
    <>
      <SkipLink
        href="#main-content"
        text={translateCommon('header.accessibility.continueToMain')}
      />
      <AppBar className="header" position="static">
        <Toolbar className="header__toolbar">
          <div className="header__left">
            <Link to={logoRedirectURL}>
              {isClerkUI ? (
                <OPHClerkLogo
                  mainLabel={translateCommon('appNameAbbreviation')}
                  subLabel={translateCommon('clerk')}
                  alt={translateCommon('ophLogo')}
                />
              ) : (
                <OPHLogoViewer
                  className="header__left__logo"
                  direction={Direction.Horizontal}
                  alt={translateCommon('ophLogo')}
                  currentLang={getCurrentLang()}
                />
              )}
            </Link>
          </div>
          <div className="header__center">
            {isAuthenticated && <ClerkNavTabs />}
          </div>
          <div className="header__right">
            {isAuthenticated && <ClerkHeaderButtons />}
            <LangSelector
              changeLang={changeLang}
              getCurrentLang={getCurrentLang}
              langDict={langDict}
              langSelectorAriaLabel={translateCommon(
                'header.accessibility.langSelectorAriaLabel'
              )}
            />
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
};
