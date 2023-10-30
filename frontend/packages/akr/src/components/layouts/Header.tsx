import { AppBar, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import { OPHClerkLogo, OPHLogoViewer, SkipLink } from 'shared/components';
import { Direction } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { AkrLangSelector } from 'components/common/AkrLangSelector';
import { ClerkNavTabs } from 'components/layouts//clerkHeader/ClerkNavTabs';
import { ClerkHeaderButtons } from 'components/layouts/clerkHeader/ClerkHeaderButtons';
import {
  getCurrentLang,
  useAppTranslation,
  useCommonTranslation,
} from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { useAuthentication } from 'hooks/useAuthentication';

export const Header = (): JSX.Element => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.header',
  });
  const translateCommon = useCommonTranslation();

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
            <AkrLangSelector usage="header" />
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
            {!isPhone && <AkrLangSelector usage="header" />}
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
};
