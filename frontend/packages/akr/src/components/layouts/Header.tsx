import { AppBar, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  LangSelector,
  OPHClerkLogo,
  OPHLogoViewer,
  SkipLink,
} from 'shared/components';
import { AppLanguage, Direction } from 'shared/enums';

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
  const translateCommon = useCommonTranslation();
  const [finnish, swedish, english] = getSupportedLangs();

  const langDict = new Map<string, AppLanguage>([
    [t('lang.fi'), finnish],
    [t('lang.sv'), swedish],
    [t('lang.en'), english],
  ]);

  const [isClerkUI, isClerkURL] = useAuthentication();
  const logoRedirectURL = isClerkUI
    ? AppRoutes.ClerkHomePage
    : AppRoutes.PublicHomePage;

  return (
    <>
      <SkipLink href="#main-content" text={t('accessibility.continueToMain')} />
      <AppBar className="header" position="static">
        <Toolbar className="header__toolbar">
          <div className="header__left">
            <Link to={logoRedirectURL}>
              {isClerkURL ? (
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
          <div className="header__center">{isClerkUI && <ClerkNavTabs />}</div>
          <div className="header__right">
            {isClerkUI && <ClerkHeaderButtons />}
            <LangSelector
              changeLang={changeLang}
              getCurrentLang={getCurrentLang}
              langDict={langDict}
              langSelectorAriaLabel={t('accessibility.langSelectorAriaLabel')}
            />
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
};
