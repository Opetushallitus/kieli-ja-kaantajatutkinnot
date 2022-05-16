import { AppBar, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import { LangSelector, OPHLogoViewer, SkipLink } from 'shared/components';
import { Direction } from 'shared/enums';

import {
  changeLang,
  getCurrentLang,
  getSupportedLangs,
  useAppTranslation,
  useCommonTranslation,
} from 'configs/i18n';
import { AppRoutes } from 'enums/app';
// import { useAuthentication } from 'hooks/useAuthentication';

export const Header = (): JSX.Element => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.header',
  });
  const translateCommon = useCommonTranslation();
  const currentLang = getCurrentLang();
  const [finnish, swedish, english] = getSupportedLangs();

  const langDict = new Map<string, string>([
    [t('lang.fi'), finnish],
    [t('lang.sv'), swedish],
    [t('lang.en'), english],
  ]);

  //   const [isClerkUI] = useAuthentication();
  //   const logoRedirectURL = isClerkUI
  //     ? AppRoutes.ClerkHomePage
  //     : AppRoutes.PublicHomePage;

  return (
    <>
      <SkipLink href="#main-content" text={t('accessibility.continueToMain')} />
      <AppBar className="header" position="static">
        <Toolbar className="header__toolbar">
          <div className="header__left">
            <Link to={AppRoutes.PublicHomePage}>
              <OPHLogoViewer
                currentLang={currentLang}
                className="header__left__logo"
                direction={Direction.Horizontal}
                alt={translateCommon('ophLogo')}
              />
            </Link>
          </div>
          <div className="header__center"></div>
          <div className="header__right">
            <LangSelector
              langDict={langDict}
              langSelectorAriaLabel={t('accessibility.langSelectorAriaLabel')}
              changeLang={changeLang}
              getCurrentLang={getCurrentLang}
            />
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
};
